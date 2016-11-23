var selectStaffID;
var selectStaffData;
var selectProjectData;

var detailDiv;
var addDiv;
var projectDetailDiv;

// 버튼 컨트롤들
function controlSetting()
{
  $("nav #navi1st button").click( function(){
    $(location).attr('href', $(this).attr('link'));
  });

  $("#systemNavi button").click( function(){
    $link = $(this).attr("link");
    $(location).attr('href', $(this).attr('link'));
  });

  $("#staffList .tableList li input:checkbox").click( function(event){
    event.stopPropagation();
  });

  $("#staffList .tableList li input:checkbox[id='mainCheckBox']").click( function(event){
    event.stopPropagation();
    checkValue = $(this).is(":checked");
    console.log(checkValue);
    $("#staffList .tableList li:visible input:checkbox").prop("checked", checkValue);
  });

  // 직원 목록에서 직원 선택 했을 때
  $("#staffList .tableList li:not(:first-child)").click( function(event){
    selectStaffData = JSON.parse( $(this).attr('value') );
    selectStaffID = selectStaffData._id;

    initStaffDetailInfoDiv();

    $("#updateStaffInfoForm #id input").val(selectStaffData.st_id);
    $("#updateStaffInfoForm #name input").val(selectStaffData.st_name);

    var teamDepthString = "";
    var nowTeam = {};
    if ( selectStaffData.st_team !== null ){
      var belongTeam = {};
      var nowTeamId = Number(selectStaffData.st_team._id);
      for( var bt=0; bt<4; bt++)
      {
        nowTeam = teamTreeData[nowTeamId];
        belongTeam = teamTreeData[Number(nowTeam.t_belong)];
        nowTeamId = Number(belongTeam._id);
        teamDepthString = belongTeam.t_name+" - "+teamDepthString;
        if (belongTeam.t_belong == -1 ) break;
      }
      $("#updateStaffInfoForm #teamSelectInputDepth").html(teamDepthString);
    }
    var stTeam = selectStaffData.st_team;
    var stTeamId = ( stTeam !== null ) ? selectStaffData.st_team._id : "";
    var stTeamName = ( stTeam !== null ) ? selectStaffData.st_team.t_name : "";
    $("#updateStaffInfoForm #teamSelectInputValue").val(stTeamId);
    $("#updateStaffInfoForm #teamSelectInput").val(stTeamName);

    $('#rank input[value='+selectStaffData.st_rank._id+']').attr("checked", true);
    $('#job input[value='+selectStaffData.st_job._id+']').attr("checked", true);

    $('#gender input[value='+selectStaffData.st_gender+']').attr("checked", true);

    $('#authority_isAdmin input[value='+Number(selectStaffData.st_authority.isAdmin)+']').attr("checked", true);
    $('#authority_isGift input[value='+Number(selectStaffData.st_authority.isGift)+']').attr("checked", true);
    $('#authority_isSuggest input[value='+Number(selectStaffData.st_authority.isSuggest)+']').attr("checked", true);

    var joinDate = new Date(selectStaffData.st_join_date);

    $("#join_date").val(joinDate.getFullYear()+"-"+(("0" + (joinDate.getMonth() + 1)).slice(-2))+"-"+(("0" + joinDate.getDate()).slice(-2)));

    $("#updateStaffInfoForm #phone input").val(selectStaffData.st_phone);

    $("#pointStaffInfo #t_point span:nth-child(2)").html(numberWithCommas(selectStaffData.st_t_point));
    $("#pointStaffInfo #g_point span:nth-child(2)").html(numberWithCommas(selectStaffData.st_g_point));

    $("#updateStaffInfoForm #putStaffInfo").val(selectStaffID);
    $("#deleteStaffInfoForm #deleteStaffInfo").val(selectStaffID);


    detailDiv.show();
  });

  $("section button").click(function(){
    var buttonId = $(this).attr('id');
    console.log("section = "+buttonId);
    switch (buttonId) {
      case "addStaff":
        addDiv.show();
        break;
      case "batchStaff":
        makeBatchList();
        batchDiv.show();
        break;
      case "searchWeek":
        var pool = $("#giftList>.tableList>li:not(:first-child)");
        pool.each(function(i, li){
          var timeString = $(li).children('span:nth-child(3)').text();
          var getDateGetTime = new Date(timeString).getTime();

          var weekTime = new Date();
          weekTime.setDate(weekTime.getDate()-7);
          var weekTimeGetTime = weekTime.getTime();

          if (getDateGetTime >=  weekTimeGetTime) $(li).show();
          else $(li).hide();
        });
        break;
      case "searchMonth":
        var pool = $("#giftList>.tableList>li:not(:first-child)");
        pool.each(function(i, li){
          var timeString = $(li).children('span:nth-child(3)').text();
          var getDateGetTime = new Date(timeString).getTime();

          var weekTime = new Date();
          weekTime.setDate(weekTime.getDate()-30);
          var weekTimeGetTime = weekTime.getTime();

          if (getDateGetTime >=  weekTimeGetTime) $(li).show();
          else $(li).hide();
        });
        break;
      case "searchTerm":
        var termStart = new Date( $("#searchTermStart").val() ).getTime();
        var termEnd = new Date( $("#searchTermEnd").val()+ " 23:59:59" ).getTime();

        var pool = $("#giftList>.tableList>li:not(:first-child)");
        pool.each(function(i, li){
          var timeString = $(li).children('span:nth-child(3)').text();
          var getDateGetTime = new Date(timeString).getTime();

          if ( termStart <= getDateGetTime  && getDateGetTime <= termEnd) $(li).show();
          else $(li).hide();
        });
        break;
      default:
    }
  });

  // 직원 검색 입력 필드의 입력 이벤트
  $("#searchStaffNameFld").bind("change paset keyup", function(){
    console.log($(this).val());
    filter("#staffList>ul>li:not(:first-child)","span:nth-child(6)",$(this).val());
  });

  $("#filterRank").change(function(){
    console.log($(this).val());
    filter("#staffList>ul>li:not(:first-child)","span:nth-child(7)",$(this).val());
  });

  $("#filterJob").change(function(){
    console.log($(this).val());
    filter("#staffList>ul>li:not(:first-child)","span:nth-child(8)",$(this).val());
  });

  // 거래 - 보낸 직원 검색 입력 필드의 입력 이벤트
  $("#searchFromStaffNameFld").bind("change paset keyup", function(){
    console.log($(this).val());
    filter("#giftList>ul>li:not(:first-child)","span:nth-child(4)",$(this).val());
  });

  // 거래 - 받은 직원 검색 입력 필드의 입력 이벤트
  $("#searchToStaffNameFld").bind("change paset keyup", function(){
    console.log($(this).val());
    filter("#giftList>ul>li:not(:first-child)","span:nth-child(5)",$(this).val());
  });

  $("#staffDetailInfo button").click(function(){
    var buttonId = $(this).attr('id');
    console.log("staffDetailInfo = "+buttonId);

    var trtPoint = 0;

    switch (buttonId) {
      case "close":
        initStaffDetailInfoDiv();
        detailDiv.hide();
        break;
      case "giveTPoint": //사용 가능한 포인트 지급
        trtPoint = $("#giveTPointInputFld").val();
        sendPoint(selectStaffID, "t", trtPoint, 0);
        break;
      case "withdrawTPoint": //사용 가능한 포인트 회수
        trtPoint = $("#withdrawTPointInputFld").val();
        sendPoint(selectStaffID, "t", -trtPoint, 1);
        break;
      case "giveGPoint": //선물 가능한 포인트 지급
        trtPoint = $("#giveGPointInputFld").val();
        sendPoint(selectStaffID, "g", trtPoint, 2);
        break;
      case "withdrawGPoint": //선물 가능한 포인트 회수
        trtPoint = $("#withdrawGPointInputFld").val();
        sendPoint(selectStaffID, "g", -trtPoint, 3);
        break;
      case "deleteStaffInfo":
        $("#deleteStaffInfoForm").submit();
        break;
      case "changeStaffInfo":
        $("#updateStaffInfoForm").submit();
        break;
      default:
    }
  });

  $("#staffAdd button").click(function(){
    var buttonId = $(this).attr('id');
    console.log("staffDetailInfo = "+buttonId);

    switch (buttonId) {
      case "close":
        addDiv.hide();
        break;
      case "staffAddSubmit":
        $("#staffAddForm").submit();
        break;
      default:
    }
  });

  $("#staffBatch button").click(function(){
    var buttonId = $(this).attr('id');
    console.log("staffBatch = "+buttonId);

    switch (buttonId) {
      case "close":
        batchDiv.hide();
        break;
      case "batchStaffInfo":
        processBatch();
        break;
    }
  });

  $(".tableList li:first-child span").click(function(){
    var pool = $(this).parent().parent().parent();
    tinysort(pool.find('.tableList>li:not(:first-child)'),'span:nth-child('+($(this).index()+1)+')');
  });

  $("#teamTree input[type=checkbox]").click(function(){
    $(this).parent().parent().children("children").toggle();
  });

  $(".btnDeleteLinkForm").click(function(){
    var linkedForm = $(this).attr('linkForm');
    $('#'+linkedForm).submit();
  });

  $("#projectList .tableList li:not(:first-child)").click( function(){
    selectProjectData = JSON.parse( $(this).attr('value') );
    console.log(selectProjectData);

    var target = $("#projectDetailInfo>.infoList");
    target.find("#pj_state>span:last-child").text( setProjectState( selectProjectData.pj_state ) );
    target.find("#pj_name>span:last-child").text( selectProjectData.pj_name );
    target.find("#pj_type>span:last-child").text( selectProjectData.pj_type.pjt_name );

    target.find("#pj_registrant>span:last-child").html( setStaffName(selectProjectData.pj_registrant) );

    target.find("#pj_regist_date>span:last-child").text( setDate( selectProjectData.pj_regist_date) );
    target.find("#pj_start_date>span:last-child").text( setDate( selectProjectData.pj_start_date) );
    target.find("#pj_end_date>span:last-child").text( setDate( selectProjectData.pj_end_date) );
    target.find("#pj_content>span:last-child").html( selectProjectData.pj_content.replace(/\r\n/gi, "<br>") );
    target.find("#pj_expectation_member_content>span:last-child").html( selectProjectData.pj_expectation_member_content.replace(/\r\n/gi, "<br>") );

    var volunteersString = "<div class='staffListHor'>";
    selectProjectData.pj_volunteer_member.forEach(function(item, i){
      volunteersString += "<span>"+setStaffName( item )+"</span>";
    });
    volunteersString += "</div>";
    target.find("#pj_volunteer_member>span:last-child").html( selectProjectData.pj_volunteer_member.length + "명" + "<br>" + volunteersString );

    var progressString = "<div class='staffListHor'>";
    selectProjectData.pj_progress_member.forEach(function(item, i){
      progressString += "<span>"+setStaffName( item )+"</span>";
    });
    progressString += "</div>";
    target.find("#pj_progress_member>span:last-child").html( selectProjectData.pj_progress_member.length + "명" + "<br>" + progressString );
    target.find("#pj_reward_ap>span:last-child").text( selectProjectData.pj_reward_ap+"Ap" );

    $("#projectStateChangeIdValue").val( selectProjectData._id );

    $("pjStateChange0").show();
    $("pjStateChange1").show();
    $("pjStateChange2").show();
    $("pjStateChange99").show();

    switch (selectProjectData.pj_state) {
      case 0:
        $("pjStateChange0").hide();
        break;
      case 1:
        $("pjStateChange1").hide();
        break;
      case 2:
        $("pjStateChange2").hide();
        break;
      case 99:
        $("pjStateChange99").hide();
        break;
      default:
    }
    projectDetailDiv.show();
  });

  $("#projectDetailInfo button").click(function(){
    var buttonId = $(this).attr('id');
    console.log("projectDetailInfo = "+buttonId);

    switch (buttonId) {
      case "close":
        //initStaffDetailInfoDiv();
        projectDetailDiv.hide();
        break;
      case "pjStateChange0":
        modifyProjectState(0);
        break;
      case "pjStateChange1":
        modifyProjectState(1);
        break;
      case "pjStateChange2":
        modifyProjectState(2);
        break;
      case "pjStateChange99":
        modifyProjectState(99);
        break;
      default:
    }
  });

  // 거래 - 보낸 직원 검색 입력 필드의 입력 이벤트
  $("#searchFromProjectRegistrantFld").bind("change paset keyup", function(){
    console.log($(this).val());
    filter("#projectList>ul>li:not(:first-child)","span:nth-child(6)",$(this).val());
  });
}

function modifyProjectState( stateValue )
{
  console.log("modifyProjectState value = "+stateValue);
  $("#projectStateChangeValue").val(stateValue);
  $("#projectStateChangeForm").submit();
}

function initStaffDetailInfoDiv()
{
  $("#giveTPointInputFld").val('0');
  $("#withdrawTPointInputFld").val('0');
  $("#giveGPointInputFld").val('0');
  $("#withdrawGPointInputFld").val('0');
  $("#givePointResult").html("");
}

function confirmDelete()
{
  console.log('check');
  var result = confirm("정말 삭제하시겠습니까?");
  if ( result === true ){
    return true;
  } else {
    return false;
  }
}

function makeTeamTree(container, teamTreeData)
{
  var teamTree;

  var displayDiv = $(container);
  var divHtml = "";
  divHtml += "<div id='t-1'>";
  divHtml += "<box><image></box>";
  divHtml += "<a>팀없음</a>";
  divHtml += "</div>";
  displayDiv.append(divHtml);
  var maxId = 0;
  teamTreeData.forEach(function(item, i){
    divHtml = "";
    if (Number(item._id) > maxId) maxId = Number(item._id);
    if (item.t_belong == -1){
      divHtml += "<div id='t"+item._id+"'>";
      divHtml += "<box><image></box>";
      divHtml += "<a>"+item.t_name+"</a>";
      divHtml += "</div>";
      displayDiv.append(divHtml);
    }
    else {
      var parent = displayDiv.find("#t"+item.t_belong);

      if(parent.children("children").html() === undefined){
        parent.children("box").html("<input type='checkbox' checked='checked'>");
        parent.append("<children></children>");
      }
      divHtml += "<div id='t"+item._id+"'>";
      divHtml += "<box><image></box>";
      divHtml += "<a>"+item.t_name+"</a>";
      divHtml += "</div>";
      displayDiv.find("#t"+item.t_belong+">children").append(divHtml);
    }
  });

  displayDiv.find("input[type=checkbox]").click(function(){
    $(this).parent().parent().children("children").toggle();
  });


  displayDiv.find("a").click( function(){
    var buttonName = $(this).text();
    var buttonId = $(this).parent().attr("id").replace("t","");
    console.log(buttonId+ " : "+buttonName);
    if (buttonName == "(주)올엠"){
      buttonName = "";
      buttonId = "";
    }
    filter("#staffList>ul>li:not(:first-child)","span:nth-child(4)",buttonId, true);
    filter("#giftList>ul>li:not(:first-child)","span:nth-child(4)",buttonId, true);
  });
}

function makeStaffList(container, staffList)
{
  var rankOptions = [];
  var jobOptions = [];

  var rankOptionHtml = '<option value="">선택</option>';
  var jobOptionHtml = '<option value="">선택</option>';

  staffList.forEach(function(item, i){

    var rankName = "";
    var jobName = "";

    if ( item.st_rank === undefined ) rankName = "직급없음";
    else rankName = item.st_rank.r_name;

    if ( item.st_job === undefined ) jobName = "직책없음";
    else jobName = item.st_job.j_name;

    if ($.inArray(rankName, rankOptions) == -1) rankOptions.push( rankName );
    if ($.inArray(jobName, jobOptions) == -1) jobOptions.push( jobName );

  });

  rankOptions.forEach(function(item, i){
    rankOptionHtml += '<option value="'+item+'">'+item+'</option>';
  });

  jobOptions.forEach(function(item, i){
    jobOptionHtml += '<option value="'+item+'">'+item+'</option>';
  });

  $("#filterRank").html(rankOptionHtml);
  $("#filterJob").html(jobOptionHtml);
}

function makeTeamSelect(container, teamTreeData)
{
  var teamTree;

  var displayDiv = $(container);
  var maxId = 0;
  teamTreeData.forEach(function(item, i){
    var divHtml = "";
    if (Number(item._id) > maxId) maxId = Number(item._id);
    if (item.t_belong == -1){
      divHtml += "<div id='t"+item._id+"'>";
      divHtml += "<button type='button' value='"+item._id+"'>"+item.t_name+"</button>";
      divHtml += "</div>";
      displayDiv.append(divHtml);
    }
    else {
      var parent = displayDiv.find("#t"+item.t_belong);

      if(parent.children("children").html() === undefined){
        parent.append("<children></children>");
      }
      divHtml += "<div id='t"+item._id+"'>";
      divHtml += "<button type='button' value='"+item._id+"'>"+item.t_name+"</button>";
      divHtml += "</div>";
      displayDiv.find("#t"+item.t_belong+">children").append(divHtml);
    }
  });
  displayDiv.find("children").hide();
  displayDiv.find("button").click(function(){

    $(this).parent().children("children").toggle();

    $(this).parent().prevAll().toggle();
    $(this).parent().nextAll().toggle();

    $("#teamSelectInputValue").val( $(this).attr('value') );
    $("#teamSelectInput").val( $(this).text() );

    $("#teamAddInputValue").val( $(this).attr('value') );
    $("#teamAddInput").val( $(this).text() );
  });
}

function makeBatchList()
{
  staffList = $("#staffList>ul>li:not(:first-child)");
  var staffLi = "";
  staffList.each( function(i, li){
    checkLi = $(this);
    checkBoolean = checkLi.find("input:checkbox").is(":checked");
    if ( checkBoolean ){
      checkValue = JSON.parse( checkLi.attr('value') );

      staffLi += "<li>";
      staffLi += "<span><input type='checkbox' checked='checked'></span>";
      staffLi += "<span>"+i+"<input type='hidden' name='put[st_staffs]' value='"+checkValue._id+"'></span>";
      staffLi += "<span>"+checkValue.st_id+"</span>";
      staffLi += "<span>"+checkValue.st_team.t_name+"</span>";
      staffLi += "<span>"+checkValue.st_name+"</span>";
      staffLi += "<span>"+checkValue.st_rank.r_name+"</span>";
      staffLi += "<span>"+checkValue.st_job.j_name+"</span>";
      staffLi += "</li>";
    }
  });
  $("#batchStaffList").append(staffLi);

  $("#batchStaffList input[type=checkbox]").click(function(){
    $(this).parent().parent().remove();
  });
}

function processBatch()
{
  $("#batchStaffInfoForm").submit();
}

function resetMainCheckBox()
{
  $("#mainCheckBox").attr("checked", false);
}



function initWorks()
{
  detailDiv = $("#staffDetailInfo");
  addDiv = $("#staffAdd");
  batchDiv = $("#staffBatch");
  projectDetailDiv = $("#projectDetailInfo");

  controlSetting();

  detailDiv.hide();
  addDiv.hide();
  batchDiv.hide();
  projectDetailDiv.hide();
}
