var socket = io.connect('http://10.100.1.202');
//var socket = io('http://10.10.70.146');
//var socket = io.connect('http://61.33.92.208');

var pointHistoryData = [];
var pointHistoryCount = 10;
var projectData = [];
var projectResult = "";
var projectTypeIndexSelect = 0;
var selectItemData = null;
var rewardData = [];
var gApoint = -1;
var tApoint = -1;

function socketSendReady(){
  socket.emit('clientReady', { staffid:myData._id});
}

socket.on('projectCreate', function(data){
  console.log("projectCreate");
  projectResult = data.result;
  projectData =  data.projectData;
  newProject = data.newProject;

  makeProjectList2();

  showErrorMsg("notice", "새로운 프로젝트가 등록 되었습니다.", newProject.pj_name);
});

socket.on('projectHitChange', function(data){
  console.log("projectHitChange");
  projectResult = data.result;
  projectData =  data.projectData;

  makeProjectList2();
});

socket.on('projectModify', function(data){
  console.log("projectModify");
  projectResult = data.result;
  projectData =  data.projectData;

  makeProjectList2();
});

socket.on('projectStateChange', function(data){
  console.log("projectStateChange");
  projectResult = data.result;
  projectData =  data.projectData;

  makeProjectList2();
});

socket.on('projectDelete', function(data){
  console.log("projectDelete");
  projectResult = data.result;
  projectData =  data.projectData;

  makeProjectList2();
});

socket.on('projectVolunteerReturn', function(data){
  console.log("projectVolunteerReturn");
  projectResult = data.result;
  projectData =  data.projectData;
  var projectInOut =  data.isIn;

  makeProjectList2();
});

socket.on('projectNewVolunteer', function(data){
  console.log("projectNewVolunteer");
  projectData =  data.projectData;
  var newVolunteerData = data.volunteerData;
  var projectInOut =  data.isIn;

  //makeProjectList2();

  if (projectInOut){
    showErrorMsg("notice", "새로운 지원자가 등록 되었습니다.", projectData.pj_name+"<br>"+setStaffName(newVolunteerData, "hor"));
  } else {
    showErrorMsg("error", "지원자가 지원을 취소 하였습니다.", projectData.pj_name+"<br>"+setStaffName(newVolunteerData, "hor"));
  }
});

socket.on('voluntProjectModify', function(data){
  console.log("voluntProjectModify");
  projectData =  data.projectData;

  //makeProjectList2();

  showErrorMsg("error", "지원한 프로젝트의 내용이 변경되었습니다.", projectData.pj_name);
});

socket.on('voluntProjectDelete', function(data){
  console.log("voluntProjectDelete");
  projectData =  data.projectData;

  //makeProjectList2();

  showErrorMsg("error", "지원한 프로젝트가 삭제되었습니다.", projectData.pj_name);
});

socket.on('ProjectProgress', function(data){
  console.log("ProjectProgress");
  projectData =  data.projectData;
  var resultData =  data.resultData;
  var isIn = data.isIn;
  var type = "";
  var msgString = "";
  switch (resultData.pj_state) {
    case 0:
      if (isIn){
        type = "notice";
        msgString = "프로젝트에 선발 되었습니다.";
      } else {
        type = "error";
        msgString = "프로젝트에 참여하지 못했습니다.";
      }
      break;
    case 1:
      if (isIn){
        type = "notice";
        msgString = "프로젝트가 완료 되었습니다.";
      }
      break;
    default:
  }

  makeProjectList2();
  showErrorMsg("notice", msgString, resultData.pj_name);
});

socket.on('changeMyData', function(data){
  console.log(data);
  $("#myGiftPoint").html(numberWithCommas(data.staffData.st_g_point)+"Ap");
  $("#myTradablePoint").html(numberWithCommas(data.staffData.st_t_point)+"Ap");

  switch(data.changeType)
  {
    case "volunteer":
      if (Number(data.changeValue) > 0){
        showErrorMsg("notice", "GAP를 획득했습니다!", "프로젝트에 지원하여 보너스 "+data.changeValue+"GAP를 획득했습니다.");
      } else {
        showErrorMsg("error", "GAP가 감소했습니다.", "지원 취소하면 지급 받은 보너스 GAP가 회수됩니다.");
      }
      break;
    case "login":
      showErrorMsg("notice", "GAP를 획득했습니다!", "로그인 보너스 "+data.changeValue+"GAP를 획득했습니다.");
      break;
  }
});

// 서버에 연결 됬음을 받았을 때
socket.on('serverReady', function (data) {
    showPopupStandby( false );

    $("#myGiftPoint").html(numberWithCommas(data.staffData.st_g_point)+"Ap");
    $("#myTradablePoint").html(numberWithCommas(data.staffData.st_t_point)+"Ap");

    gApoint = data.staffData.st_g_point;
    tApoint = data.staffData.st_t_point;

    pointHistoryData = data.giftData;
    projectData =  data.projectData;
    rewardData = data.rewardData;

    makeGiftList($("#SceneMyState .pointHistory"), 3);
    makeGiftList($("#SceneHistory .pointHistory"), -1);

    makeProjectList2();

    makeRewardList();

    chkUnLookGiftList(data.giftData, data.staffData);
});
// 포인트 선물을 받았을 때
socket.on('getPoint', function (data) {
    if( data.pointType == "g"){
      $("#myGiftPoint").html(numberWithCommas(Number(data.to.st_g_point)+Number(data.toPoint))+"Ap");
      $("#myTradablePoint").html(numberWithCommas(Number(data.to.st_t_point))+"Ap");
      gApoint = Number(data.to.st_g_point)+Number(data.toPoint);
      tApoint = Number(data.to.st_t_point);
    } else {
      $("#myGiftPoint").html(numberWithCommas(Number(data.to.st_g_point))+"Ap");
      $("#myTradablePoint").html(numberWithCommas(Number(data.to.st_t_point)+Number(data.toPoint))+"Ap");
      gApoint = Number(data.to.st_g_point);
      tApoint = Number(data.to.st_t_point)+Number(data.toPoint);
    }

    pointHistoryData = data.giftData;

    makeGiftList($("#SceneMyState .pointHistory"), 3);
    makeGiftList($("#SceneHistory .pointHistory"), -1);

    $("#PopupGetPointResult from").html("<small>"+data.from.st_team.t_name+"팀</small><br>"+data.from.st_name+" "+((data.from.st_job.j_name != "-") ? data.from.st_job.j_name : data.from.st_rank.r_name));
    $("#PopupGetPointResult to").html("<small>"+data.to.st_team.t_name+"팀</small><br>"+data.to.st_name+" "+((data.to.st_job.j_name != "-") ? data.to.st_job.j_name : data.to.st_rank.r_name));
    var reasonString = data.myGift.gt_reason.r_name;
    if (data.myGift.gt_comment != undefined) reasonString += "<br><small>"+data.myGift.gt_comment+"</small>"
    $("#PopupGetPointResult reason").html(reasonString);

    $("#PopupGetPointResult point").html("+"+numberWithCommas(data.toPoint)+"Ap");

    $("#PopupGetPointResult to").addClass("me");

    $("#PopupGetPointResult").hide();
    $("#PopupGetPointResult").slideDown(200);

});
// 포인트 선물이 성공 했을 때
socket.on('sendSuccess', function (data) {
    $("#myGiftPoint").html(numberWithCommas(Number(data.from.st_g_point)-Number(data.toPoint))+"Ap");
    $("#myTradablePoint").html(numberWithCommas(data.from.st_t_point)+"Ap");

    gApoint = Number(data.from.st_g_point)-Number(data.toPoint);
    tApoint = Number(data.from.st_t_point);

    pointHistoryData = data.giftData;

    makeGiftList($("#SceneMyState .pointHistory"), 3);
    makeGiftList($("#SceneHistory .pointHistory"), -1);

    $("#PopupGiftPointResult from").html(setStaffName(data.from,"hor"));
    $("#PopupGiftPointResult to").html(setStaffName(data.to, "hor"));
    $("#PopupGiftPointResult reason").html("<small>"+data.myGift.gt_reason.r_name+"</small><br>"+data.myGift.gt_comment);

    var reasonString = data.myGift.gt_reason.r_name;
    if (data.myGift.gt_comment != undefined) reasonString += "<br><small>"+data.myGift.gt_comment+"</small>";
    $("#PopupGiftPointResult reason").html(reasonString);
    $("#PopupGiftPointResult point").html("-"+numberWithCommas(data.toPoint)+"Ap");
    $("#PopupGiftPointResult from").addClass("me");

    //hideAllGiftPage();
    resetGiftValues();
    //$("#SceneGift #PageToStaff").show();
    hideAllScene();
    $("#SceneMyState").show();

    $("#PopupGiftPointResult").hide();
    $("#PopupGiftPointResult").slideDown(200);

    showPopupStandby( false );
});

socket.on('disconnectToClient', function(data){
  alert('disconnect from server');
});

socket.on('connect_error', function(err){
  showErrorMsg("error", "서버가 정상적이지 않습니다.", "잠시후 다시 이용해 주세요");
});

//선물 내역 ul li 만들기
// divObject: 어디에
// listData: 어떤 데이터를 가지고
// staffData: 내 정보
// displayCount: 몇개까지 뿌려 줄건가 ( -1이면 받은 대로 )
function makeGiftList(divObject, displayCount){
  var staffData = myData;
  var listData = pointHistoryData;
  var count = 0;
  var appendUl = "<ul>";

  $.each(listData, function( index, value ){
    var isGift = (staffData._id.toString() === value.gt_from_id._id.toString());
    var giftDate = new Date(value.gt_date);
/*
    var appendLi = "<li data='"+JSON.stringify(value)+"'>";
    appendLi += "<date>"+(giftDate.getMonth()+1)+"/"+giftDate.getDate()+"<br>";
    appendLi += (giftDate.getHours()+1)+":"+(giftDate.getMinutes()+1)+"</date>";
    appendLi += "<from "+( (isGift) ? "class='me'":"" ) +">";
    appendLi += "<small>"+value.gt_from_id.st_team.t_name+"</small><br>";
    appendLi += value.gt_from_id.st_name+"<br>";
    appendLi += (value.gt_from_id.st_job.j_name != "-" ) ? value.gt_from_id.st_job.j_name : value.gt_from_id.st_rank.r_name;
    appendLi += "</from>";
    appendLi += "<arrow>→</arrow>";
    appendLi += "<to "+( (!isGift) ? "class='me'":"" ) +"><small>";
    appendLi += value.gt_to_id.st_team.t_name+"</small><br>";
    appendLi += value.gt_to_id.st_name+"<br>";
    appendLi += (value.gt_to_id.st_job.j_name != "-" ) ? value.gt_to_id.st_job.j_name : value.gt_to_id.st_rank.r_name;
    appendLi += "</to>";
    appendLi += "<point class='"+( ((value.gt_point_type.toLowerCase() != "g") || isGift ) ? "giftPointColor" : "myPointColor")+"'>"+numberWithCommas(value.gt_point)+"p</point>";
    appendLi += "</li>";
*/
    var appendLi = "<li data='"+JSON.stringify(value)+"'>";
    appendLi += "<date>"+("0"+(giftDate.getMonth()+1)).slice(-2)+"/"+("0"+giftDate.getDate()).slice(-2)+" ";
    appendLi += ("0"+(giftDate.getHours()+1)).slice(-2)+":"+("0"+(giftDate.getMinutes()+1)).slice(-2)+"</date>";
    if (!isGift) appendLi += "<from>"+setStaffName(value.gt_from_id, "hor")+"</from>";
    if (isGift) appendLi += "<to>"+setStaffName(value.gt_to_id, "hor")+"</to>";
    appendLi += "<point class='"+( ((value.gt_point_type.toLowerCase() != "g") || isGift ) ? "giftPointColor" : "myPointColor")+"'>"
    appendLi += ( ((value.gt_point_type.toLowerCase() != "g") || isGift ) ? "-" : "+") + numberWithCommas(value.gt_point);
    appendLi += ( ((value.gt_point_type.toLowerCase() != "g") || isGift ) ? "Ap" : "Ap") +"</point>";
    appendLi += "</li>";
    appendUl += appendLi;

    if (isGift) divObject.find("li:last-child from").addClass("me");
    else divObject.find("li:last-child to").addClass("me");

    if(++count >= displayCount && displayCount > -1) return false;
    if(count > pointHistoryCount) return false;
  });
  appendUl += "</ul>";
  divObject.html(appendUl).trigger("create");

  divObject.find("li").click(function(){
    var liItemData = $(this).attr('data');
    makeGiftDetail(liItemData, staffData);
  });
}

function chkUnLookGiftList(listData, staffData){
  var lookCount = 0;
  var sumPoint = 0;
  var appendUl = "<ul>";
  $.each(listData, function( index, value ){
    var isGift = (staffData._id.toString() === value.gt_from_id._id.toString());
    var giftDate = new Date(value.gt_date);
    if ( !isGift && !value.gt_look ){
      lookCount += 1;
      sumPoint += Number(value.gt_point);
      var appendLi = "<li>";
      appendLi += "<date>"+("0"+(giftDate.getMonth()+1)).slice(-2)+"/"+("0"+giftDate.getDate()).slice(-2)+"<br>";
      appendLi += ("0"+(giftDate.getHours()+1)).slice(-2)+":"+("0"+(giftDate.getMinutes()+1)).slice(-2)+"</date>";
      appendLi += "<from>"+setStaffName(value.gt_from_id, "hor")+"</from>";
      appendLi += "<point class='myPointColor'>+"+numberWithCommas(value.gt_point)+"Ap</point>";
      appendLi += "</li>";

      appendUl += appendLi;
    }
  });
  appendUl += "</ul>";

  if ( lookCount>0 )
  {
    var LookSummaryString = "";
    LookSummaryString += "모두 "+lookCount+"개의 선물을 받아<br>";
    LookSummaryString += "<span class='myPointColor'>" + sumPoint+"Ap</span>를 획득했습니다.";

    $("#PopupLookCheck .LookSummary").html( LookSummaryString );

    $("#PopupLookCheck .LookList").html( appendUl );
    $("#PopupLookCheck").show();
  }
}

/*
* 포인트 내역의 상세 페이지 정보 만들기
*/
function makeGiftDetail(detailData, staffData){
  detailData = JSON.parse(detailData);
  var isGift = (staffData._id.toString() === detailData.gt_from_id._id.toString());
  var giftDate = new Date(detailData.gt_date);

  var GiftDetailDiv = $('#PopupGiftDetail');

  var fromStaffString = setStaffName(detailData.gt_from_id);
  var toStaffString = setStaffName(detailData.gt_to_id);
// class="giftPointColor"
  var pointString = numberWithCommas(detailData.gt_point)+"Ap";

  GiftDetailDiv.find('reason').html(detailData.gt_reason.r_name);
  GiftDetailDiv.find('comment').html(detailData.gt_comment);
  if ( isGift ){
    //준거
    GiftDetailDiv.find('resultTitle').html("포인트를 선물했습니다!");
    GiftDetailDiv.find('topStaff').html(toStaffString);
    //GiftDetailDiv.find('bottomStaff').html(fromStaffString);

    //GiftDetailDiv.find('bottomStaff').removeClass("me");
    //GiftDetailDiv.find('bottomStaff').addClass("me");
    GiftDetailDiv.find('point').html("-"+pointString);
    GiftDetailDiv.find('point').removeClass("myPointColor");
    GiftDetailDiv.find('point').addClass("giftPointColor");
  } else {
    //받은거
    GiftDetailDiv.find('resultTitle').html("포인트를 받았습니다!");
    GiftDetailDiv.find('topStaff').html(fromStaffString);
    //GiftDetailDiv.find('bottomStaff').html(toStaffString);

    //GiftDetailDiv.find('bottomStaff').removeClass("me");
    //GiftDetailDiv.find('bottomStaff').addClass("me");
    GiftDetailDiv.find('point').html("+"+pointString);
    GiftDetailDiv.find('point').removeClass("giftPointColor");
    GiftDetailDiv.find('point').addClass("myPointColor");
  }
  var dateString = ("0"+(giftDate.getMonth()+1)).slice(-2)+"/"+("0"+giftDate.getDate()).slice(-2)+" ";
  dateString += ("0"+(giftDate.getHours()+1)).slice(-2)+":"+("0"+(giftDate.getMinutes()+1)).slice(-2);
  GiftDetailDiv.find('date').html(dateString);

  GiftDetailDiv.show();
}

// 씬들을 모두 끈다.
function hideAllScene(){
  $("#SceneMyState").hide();
  $("#SceneGift").hide();
  $("#SceneHistory").hide();
  $("#SceneProject").hide();
  $("#SceneProjectRegistPage").hide();
  $("#PopupProjectDetail").hide();
  $("#SceneProjectModifyPage").hide();
  $("#SceneReward").hide();

  $('#PopupGiftDetail').hide();
  $('#PopupGiftConfirm').hide();
  $('#SceneModifyMyState').hide();
  $('#PopupAlert').hide();
  $('#PopupLookCheck').hide();
  $('#PopupConfirm').hide();
}

function hideAllGiftPage(){
  $("#SceneGift #PageToStaff").hide();
  $("#SceneGift #PageToReason").hide();
  $("#SceneGift #PageToPoint").hide();
  //$("#SceneGift #PageGift").hide();
}

function resetGiftValues(){
  // $("#PageGift #To").html("");
  $("#PageGift #ToValue").html("");
  // $("#PageGift #ToReason").html("");
  $("#PageGift #ToReasonValue").html("");
  $("#PageGift #ToReasonComment").html("");
  // $("#PageGift #ToPoint").html("");
  $("#PageGift #ToPointValue").html("");
  $("#PageToReason #comment").val("");
  $("#PageToPoint #toPoints").val($("#PageToPoint #toPoints").attr("min"));

  $("#accordion>h3:nth-child(1)>result").html("");
  $("#accordion>h3:nth-child(3)>result>reason").html("");
  $("#accordion>h3:nth-child(3)>result>comment").html("");
  $("#accordion>h3:nth-child(5)>result").html("");

  $( "#accordion" ).accordion( "option", "active", 0 );
}

// 버튼 컨트롤들
function controlSetting()
{
  $('#myPageBtn').click(function(){
    hideAllScene();
    $('#SceneModifyMyState').show();
  });
  $('#logoutBtn').click(function(){
    $(location).attr('href','/logout');
  });
  $('#adminBtn').click(function(){
    $(location).attr('href','/admin');
  });
  $('#PopupAlert').click(function(){
    $(this).hide();
  });
  // 선물 받음 확인 버튼 클릭 하면
  $("#getButton").click(function(){
    $("#PopupGetPointResult").hide();
  });
  // 선물 했음 확인 버튼 클릭 하면
  $("#giftButton").click(function(){
    $("#PopupGiftPointResult").hide();
  });
  // 내역 상세 화면 닫기
  $('#PopupGiftDetail Button').click(function(){
    $('#PopupGiftDetail').hide();
  });


  // 네비게이션 버튼 - 포인트 선물 클릭 하면
  $("#giftBtn").click(function(){
    showSceneGift();
  });
  // 네비게이션 버튼 - 선물 내역 클릭 하면
  $("#historyBtn").click(function(){
    showSceneHistory();
  });

  $("#projectBtn").click(function(){
    showSceneProject();
  });

  $("#rewardBtn").click(function(){
    showSceneReward();
  });



  //선물하기 직원 선택

  $(".teamStaff button").click(function(){
    var clickBtn = $(this);
    var btnText = clickBtn.text().split("\n");
    var showString = "<small>"+btnText[1]+"팀</small> <b>"+btnText[2]+ "</b> <small>"+btnText[3]+"</small>";
    //hideAllGiftPage();
    $("#accordion>h3:first-child>result").html(showString);
    $("#PageGift #To").html(showString);
    $("#PageGift #ToValue").html(clickBtn.attr("value"));
    //$("#SceneGift #PageToReason").show();

    $("#PopupGiftConfirm topStaff").html(showString);
  });

  $(".teamSelect button").click(function(){
    var clickBtn = $(this);
    var teamId = clickBtn.val();
    var teamChildString = ",";

    teamChildString = getAllChildFromTeam( teamTree[teamId], teamId, teamChildString );

    $(".teamStaff button").each( function(i, item){
      var chkBtn = $(this);
      var teamId = chkBtn.attr("teamValue");

      if ( teamChildString.indexOf( ","+teamId+"," ) > -1 )
      {
        chkBtn.show();
      } else {
        chkBtn.hide();
      }

    });
  });

  //선물하기 직원 선택 한글 자음 버튼 클릭
  // $("#SceneGift #PageToStaff .hangle").click(function(){
  //   var clickBtn = $(this);
  //   var indexKey = clickBtn.text();
  //
  //   $("#SceneGift #PageToStaff button:not(.hangle)").each(function(i, item){
  //     var btn = $(this);
  //     //var btnName = btn.html().split("<br>");
  //     var btnName = btn.text().replace(/\n/gi,"&&").split("&&");
  //     var staffName = btnName[2].trim().toKorChars();
  //     if ( indexKey == staffName[0] ) btn.show();
  //     else btn.hide();
  //   });
  // });

  //선물 하기 이유 버튼 클릭 시
  $("#SceneGift #PageToReason button").click(function(){
    var clickBtn = $(this);
    //hideAllGiftPage();
    $("#accordion>h3:nth-child(3)>result>reason").html(clickBtn.text());

    //$("#PageGift #ToReason").html(clickBtn.text()+"<br><small>"+$("#SceneGift #PageToReason #comment").val()+"</small>");
    $("#PageGift #ToReasonValue").html(clickBtn.attr("value"));

    //$("#SceneGift #PageToPoint").show();

    $("#PopupGiftConfirm reason").html(clickBtn.text());

  });

  $("#comment").keyup( function(){
    var commentString = $(this).val();
    $("#accordion>h3:nth-child(3)>result>comment").html("<small>"+commentString+"</small>");
    $("#PageGift #ToReasonComment").html(commentString);
    $("#PopupGiftConfirm comment").html(commentString);
  });

  //선물 하기 금액 버튼 클릭 시
  $("#SceneGift #PageToPoint button").click(function(){
    var clickBtn = $(this);
    var clickValue = Number(clickBtn.attr("value"));
    var maxGiftPt = Number($("#myGiftPoint").text().replace("p","").replace(/,/gi, ""));

    if ( maxGiftPt <= 0 ) showErrorMsg("error", "선물할 포인트가 없습니다.", "더이상 선물할 포인트가 없습니다.<br>선물 가능한 포인트를 혹득한 후 다시 시도해 주세요");

    var newValue = 0;
    if ( clickValue !== 0 ) newValue = Number($("#PageToPoint #toPoints").val()) + clickValue;
    if (newValue < 0) newValue = 0;
    if (newValue > maxGiftPt) newValue = maxGiftPt;

    // $("#PageGift #ToPoint").html(numberWithCommas($("#SceneGift #PageToPoint #toPoints").val())+"p");
    $("#PageToPoint #toPoints").val( newValue );
    $("#PageGift #ToPointValue").html(newValue);
    $("#accordion>h3:nth-child(5)>result").html(newValue);

    $("#PopupGiftConfirm point").html(numberWithCommas(newValue)+"Ap");
  });

  //선물 하기 버튼 클릭 시
  $("#SceneGift #sendBtn").click(function(){
console.log("#SceneGift #sendBtn Click");
    var sendTo = $("#PageGift #ToValue").html();
    var sendReason = $("#PageGift #ToReasonValue").html();
    var sendComment = $("#PageGift #ToReasonComment").html();
    var sendPt = $("#PageGift #ToPointValue").html();

    if ( sendTo === "" )
    {
      showErrorMsg("error", "받을 직원을 선택해 주세요", "");
      $( "#accordion" ).accordion( "option", "active", 0 );
      return;
    } else if ( sendReason === "" )
    {
      showErrorMsg("error", "선물 이유를 선택해 주세요", "");
      $( "#accordion" ).accordion( "option", "active", 1 );
      return;
    }
    else if ( sendPt === "" )
    {
      showErrorMsg("error", "선물 포인트를 결정해 주세요", "");
      $( "#accordion" ).accordion( "option", "active", 2 );
      return;
    }
    else if ( sendPt === "0" )
    {
      showErrorMsg("error", "선물 포인트가 0pt입니다. 좀더 설정해 주세요", "");
      $( "#accordion" ).accordion( "option", "active", 2 );
      return;
    }

    $("#PopupGiftConfirm").show();
  });

  $("#giftConfirmButton").click(function(){
    var sendTo = $("#PageGift #ToValue").html();
    var sendReason = $("#PageGift #ToReasonValue").html();
    var sendComment = $("#PageGift #ToReasonComment").html();
    var sendPt = $("#PageGift #ToPointValue").html();

   showPopupStandby( true );
   $("#PopupGiftConfirm").hide();
   socket.emit('send_pt',{ from:myData._id, to:sendTo, toPoint:sendPt, toReason:sendReason, toComment:sendComment });
  });

  $(".closeBtn").click(function(){
    $(this).parent().parent().parent().hide();
  });

  $("#st_pw_1").keyup(function(){
    var pw1 = $(this).val();
    var pw2 = $("#st_pw_2").val();

    if( pw1 === pw2 ) $("#pw_compare").html("<span style='color:#99cc00'>일치</span>");
    else $("#pw_compare").html("<span style='color:#cc0000'>불일치</span>");
  });

  $("#st_pw_2").keyup(function(){
    var pw2 = $(this).val();
    var pw1 = $("#st_pw_1").val();

    if( pw1 === pw2 ) $("#pw_compare").html("<span style='color:#99cc00'>일치</span>");
    else $("#pw_compare").html("<span style='color:#cc0000'>불일치</span>");
  });

  $("#staffModifyFormSubmitBtn").click(function(){
    var pw0 = $("#st_pw_0").val();
    var pw1 = $("#st_pw_1").val();
    var pw2 = $("#st_pw_2").val();

    if ( pw0 === "" ) {
      showErrorMsg("error", "현재 비밀번호를 입력해 주세요.", "");
      return;
    }

    if( pw1 !== pw2 ) {
      showErrorMsg("error", "변경할 비밀번호가 일치하지 않습니다.", "");
      return;
    }

    if ( pw1 === "" || pw2 === "" ) {
      showErrorMsg("error", "변경할 비밀번호를 입력해 주세요.", "");
      return;
    }

    $("#staffModifyForm").submit();
  });

  $("#SceneHistory .pointHistory").scroll(function(){
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {

      if ( pointHistoryData.length > pointHistoryCount )
      {
        pointHistoryCount += 10;
        makeGiftList($("#SceneHistory .pointHistory"), -1);
      }
    }
  });

  $(".backBtn").click(function(){
    $("#SceneMyState").show();
    $(this).parent().parent().hide();
  });

  // 프로젝트 등록
  $("#SceneProjectRegistPage #projectTypes button").click(function(){
    var typeIndex = $(this).val();
    changeProjectLabels($("#SceneProjectRegistPage"), typeIndex);
    $("#SceneProjectRegistPage #pj_type").val( typeIndex );
    $("#SceneProjectRegistPage #projectTypeResult").html( $(this).html() );
  });

  $("#regProject").click(function(){
    if ( !myData.st_authority.isSuggest ){
      showErrorMsg("error", "프로젝트 등록 권한이 없습니다.", "관리자에게 문의 바랍니다.");
      return;
    }
    hideAllScene();
    initProjectRegist();
    $("#SceneProjectRegistPage").show();
  });

  $("#SceneProjectModifyPage #projectTypes button").click(function(){
    var typeIndex = $(this).val();
    changeProjectLabels($("#SceneProjectModifyPage"), Number(typeIndex) );
    $("#SceneProjectModifyPage #type").val( typeIndex );
    $("#SceneProjectModifyPage #projectTypeResult").html( $(this).html() );
  });

  $("#submitRegistProject").click(function(){
    $(this).blur();
    checkProjectRegistForm();
  });

  $("#projectRegistBackBtn").click(function(){
    $("#SceneProjectRegistPage").hide();
    $("#SceneProject").show();
  });

  $(".projectTypeBtns li").click(function(){
    //makeProjectList( $("#SceneProject .projectList"), -1, Number( $(this).attr("value")) );
    makeProjectList2( Number( $(this).attr("value")) );
  });

  $("#PopupProjectDetail button").click(function(){
    var btnId = $(this).attr("id");
    $(this).blur();

    var bodyFrame = $("#PopupProjectDetail .PageProjectDetail");
    var projectId = bodyFrame.find("#DetailProjectId").val();

    switch (btnId) {
      case "btnVolunteer":
        console.log("PopupProjectDetail btnVolunteer button Click");
        var titleString = "프로젝트에<br>지원하시겠습니까?";
        var contentString = "";
        showConfirm( titleString , contentString, function(){
          $("#PopupProjectDetail").hide();
          socket.emit('projectVolunteer', {projectId:projectId, staffid:myData._id ,isIn:true, registrantid:bodyFrame.find("#registrantId").val()});
        });
        break;
      case "btnVolunteerCancel":
        var titleString = "프로젝트 지원을<br>취소하시겠습니까?";
        var contentString = "";
        showConfirm( titleString , contentString, function(){
          $("#PopupProjectDetail").hide();
          socket.emit('projectVolunteer', {projectId:projectId, staffid:myData._id ,isIn:false, registrantid:bodyFrame.find("#registrantId").val()});
        });
        break;
      case "btnStart":
        if ( Number(bodyFrame.find("#selectVolunteerMembersCount").val()) === 0 ) {
          showErrorMsg("error", "지원자가 없습니다.", "지원자가 없을 경우 프로젝트 진행을 할 수 없습니다.");
        } else if ( bodyFrame.find("#selectVolunteerMembers").val() === "" ) {
          showErrorMsg("error", "지원자를 선택하지 않았습니다.", "지원자 중 프로젝트를 같이 진행할 직원을 선택해 주세요.");
        } else {
          var titleString = "프로젝트를 시작하시겠습니까?";
          var contentString = "";
          showConfirm( titleString , contentString, function(){
            $("#PopupProjectDetail").hide();
            socket.emit('projectStateChange', {projectId:projectId, projectState:1, projectVolunteers:bodyFrame.find("#selectVolunteerMembers").val()});
          });
        }
        break;
      case "btnModify":
        hideAllScene();
        setProjectModifyPage();
        $("#SceneProjectModifyPage").show();
        break;
      case "btnDelete":
        var titleString = "프로젝트를 삭제하시겠습니까?";
        var contentString = "";
        showConfirm( titleString , contentString, function(){
          $("#PopupProjectDetail").hide();
          socket.emit('projectDelete', {projectId:projectId})
        });
        break;
      case "btnEnd":
        var titleString = "프로젝트를 완료하시겠습니까?";
        var contentString = "";
        showConfirm( titleString , contentString, function(){
          $("#PopupProjectDetail").hide();
          socket.emit('projectStateChange', {projectId:projectId, projectState:2});
        });
        break;
      default:

    }
  });

  $("#SceneProjectModifyPage button").click(function(){
    var btnId = $(this).attr("id");

    var bodyFrame = $("#PopupProjectDetail");
    var projectId = bodyFrame.find("#ProjectId").val();

    switch (btnId) {
      case "modifyProject":
        checkProjectModifyForm();
        break;
      default:
    }
  });

  $("#projectModifyBackBtn").click(function(){
    $("#SceneProjectModifyPage").hide();
    $("#SceneProject").show();
    $("#PopupProjectDetail").show();
  });

  $(".mainSubHeadMore").click(function(){
    var key = $(this).attr("data");
    var index = $(this).attr("value");

    switch (key) {
      /*
      case "gift":
        showSceneGift();
        break;
      */
      case "aphistory":
        showSceneHistory();
        break;
      case "project":
        showSceneProject();
        makeProjectList2(Number(index));
        break;
      case "reward":
        showSceneReward();
        break;
      default:
    }
  });
}

// 대기 화면 컨트롤
function showPopupStandby( visible )
{
  var PopupStandby = $("#PopupStandby");
  if ( visible ) PopupStandby.show();
  else PopupStandby.fadeOut(100);
}

//팀 리스트 만들기
function makeTeamList()
{
  teamTree = [];
  teamData.sort(function(a, b) {
    return parseFloat(b._id) - parseFloat(a._id);
  });
  teamData.forEach(function(item, i){
    if ( teamTree[item.t_belong] === undefined ) teamTree[item.t_belong] = [];
    if ( teamTree[item._id] === undefined ) teamTree[item._id] = [];
    teamTree[item.t_belong].push( item._id );
    teamTree[item._id].push( item._id );
  });
}

function showErrorMsg( type, title, msg ){
  var titleObj = $('#PopupAlert t3');
  var msgObj = $('#PopupAlert msg');

  titleObj.html(title);
  msgObj.html(msg);

  titleObj.removeClass("msgErrorTitle");
  msgObj.removeClass("msgErrorMsg");
  titleObj.removeClass("msgNoticeTitle");
  msgObj.removeClass("msgNoticeMsg");

  switch(type){
    case "notice":
      titleObj.addClass("msgNoticeTitle");
      msgObj.addClass("msgNoticeMsg");
      break;
    case "error":
      titleObj.addClass("msgErrorTitle");
      msgObj.addClass("msgErrorMsg");
      break;
    default:
      return;
  }
  $('#PopupAlert').show();
}

// 페이지 레디 되면 할 것들
function initWorks()
{
  socketSendReady();
  controlSetting();
  makeTeamList();

  // 선물 받음 레이어 안보이게
  $("#PopupGiftPointResult").hide();
  // 선물 했음 레이어 안보이게
  $("#PopupGetPointResult").hide();

  // 일단 모든 레이어 안보이게
  hideAllScene();
  // 내 포인트 레이어 보이게
  $("#SceneMyState").show();
}
/*
function makeProjectList( divObject, displayCount, type )
{
  if ( type === undefined ) type = 0;
  var appendUl = "";
  var count = 0;
  var projectListCounts = [0,0,0,0,0,0];
  projectListCounts[0] = projectData.length;

  $.each(projectData, function( index, value ){
    var isMyProject = ( myData._id === value.pj_registrant._id );
    var isValunteer = false;
    var isProcess = false;
    value.pj_volunteer_member.forEach(function(item, i){
      if ( item._id === myData._id ) isValunteer = true;
    });
    value.pj_progress_member.forEach(function(item, i){
      if ( item._id === myData._id ) isProcess = true;
    });

    if ( value.pj_state === 0 && isMyProject ) projectListCounts[1]++;
    if ( value.pj_state === 0 && !isMyProject && !isValunteer ) projectListCounts[2]++;
    if ( value.pj_state === 0 && isValunteer ) projectListCounts[3]++;
    if ( value.pj_state === 1 && ( isMyProject || isProcess) ) projectListCounts[4]++;
    if ( value.pj_state === 2 && ( isMyProject || isProcess) ) projectListCounts[5]++;
    if (
      ( type === 0 ) ||
      ( type === 1 && value.pj_state === 0 && isMyProject ) ||
      ( type === 2 && value.pj_state === 0 && !isMyProject && !isValunteer ) ||
      ( type === 3 && value.pj_state === 0 && isValunteer ) ||
      ( type === 4 && value.pj_state === 1 && ( isMyProject || isProcess) ) ||
      ( type === 5 && value.pj_state === 2 && ( isMyProject || isProcess) )
    )
    {
      var pjState = "["+setProjectState( (isValunteer && value.pj_state === 0 ) ? 3:value.pj_state )+"] ";
      var pjName = pjState + value.pj_name;
      var pjReward = value.pj_reward_ap;
      var pjVolunteer = value.pj_volunteer_member.length+"명";
      var pjProcess = value.pj_progress_member.length+"명";
      var memberCount = ( value.pj_state === 0 ) ? pjVolunteer:pjProcess;

      //var appendLi = "<li data='"+JSON.stringify(value)+"' "+ ( (isMyProject || isValunteer || isProcess ) ? "class='me":"") +"'>";
      var appendLi = "<li data='"+JSON.stringify(value)+"' >";
      appendLi += "<name>"+pjName+"</name>";
      appendLi += "<people>"+memberCount+"</people>";
      appendLi += "<reward class='myPointColor'>"+numberWithCommas(pjReward)+"Ap</reward>";
      appendLi += "</li>";
      appendUl += appendLi;

      if(++count >= displayCount && displayCount > -1) return false;
      //if(count > pointHistoryCount) return false;
    }
  });
  if ( appendUl === "" ) appendUl = "<li style='font-size:12px; text-align:center;'>관련 프로젝트가 없습니다.</li>";
  appendUl = "<ul>"+appendUl+"</ul>";

  divObject.html(appendUl).trigger("create");

  divObject.find("li").click(function(){
    var liItemData = $(this).attr('data');
    if ( liItemData === undefined ) return;
    liItemData = JSON.parse( liItemData );
    makeProjectDetail(liItemData);
  });

  setProjectTypeTabCount(projectListCounts);
}
*/

function makeProjectList2( projectTypeIndex )
{
  if ( projectTypeIndex === undefined ) projectTypeIndex = projectTypeIndexSelect;
  projectTypeIndexSelect = projectTypeIndex;
  var appendUl = "";
  var count = 0;
  var projectListCounts = [0,0,0,0,0,0];
  var projectListArray = [[],[],[],[],[],[]];
  projectListCounts[0] = projectData.length;

console.log(projectData);

  $.each(projectData, function( index, value ){
    var isMyProject = ( myData._id === value.pj_registrant._id );
    var isValunteer = false;
    var isProcess = false;
    value.pj_volunteer_member.forEach(function(item, i){
      if ( item._id === myData._id ) isValunteer = true;
    });
    value.pj_progress_member.forEach(function(item, i){
      if ( item._id === myData._id ) isProcess = true;
    });

      var pjState = "["+setProjectState( (isValunteer && value.pj_state === 0 ) ? 3:value.pj_state )+"] ";
      var pjName = pjState + value.pj_name;
      var pjReward = value.pj_reward_ap;
      var pjVolunteer = "지원<br>"+value.pj_volunteer_member.length;
      var pjProcess = "참여<br>"+value.pj_progress_member.length;
      var memberCount = ( value.pj_state === 0 ) ? pjVolunteer:pjProcess;
      var hitCount = (value.pj_hits == undefined) ? 0:value.pj_hits;

      var today = new Date();
      var oldStyleString = "";
      var gapDay = 0;
      if ( value.pj_recruiment_period_day !== undefined ){
        var pjRecruimentPeriodDay = new Date(value.pj_recruiment_period_day);
        var yesterday = today.setDate(today.getDate() - 1);
        gapDay = yesterday - pjRecruimentPeriodDay;
      }
      if ( gapDay > 0 ){
        oldStyleString = " class='passDate'";
      }

      var newDay = 0;
      var newDayHtml = "";
      if ( value.pj_regist_date !== undefined  ){
        var pjRegistDay = new Date(value.pj_regist_date);
        newDay = (( today - pjRegistDay )/1000/60/60/24);
        if ( newDay < 3 ) newDayHtml = "<newMark>N</newMark>";
      }

      //var appendLi = "<li data='"+JSON.stringify(value)+"' "+ ( (isMyProject || isValunteer || isProcess ) ? "class='me":"") +"'>";
      var dataString = JSON.stringify(value).replace(/'/gi, '&#x0027;');
      var appendLi = "<li data='"+dataString+"' >";

      appendLi += "<name"+oldStyleString+">"+newDayHtml+pjName+"</name>";
      appendLi += "<reward class='myPointColor'>"+numberWithCommas(pjReward)+"Ap</reward>";
      appendLi += "<people>"+memberCount+"</people>";
      appendLi += "<hits>열람<br>"+numberWithCommas(hitCount)+"</hits>";
      appendLi += "</li>";
      //appendUl += appendLi;
      //if(++count >= displayCount && displayCount > -1) return false;
      //if(count > pointHistoryCount) return false;

    /* 0전체  1작성  2모집  3지원  4진행  5완료 */
    projectListArray[0].push(appendLi);
    if ( value.pj_state === 0 && isMyProject ){ projectListCounts[1]++; projectListArray[1].push(appendLi); }
    if ( value.pj_state === 0 && !isMyProject && !isValunteer ){ projectListCounts[2]++; projectListArray[2].push(appendLi);}
    if ( value.pj_state === 0 && isValunteer ){ projectListCounts[3]++; projectListArray[3].push(appendLi);}
    if ( value.pj_state === 1 && ( isMyProject || isProcess) ){ projectListCounts[4]++; projectListArray[4].push(appendLi);}
    if ( value.pj_state === 2 && ( isMyProject || isProcess) ){ projectListCounts[5]++; projectListArray[5].push(appendLi);}
  });

  setProjectData( $("#projectListMain"), projectListArray[2], 3);
  setProjectData( $("#projectListMainReg"), projectListArray[1], 3);
  setProjectData( $("#projectListMainStart"), projectListArray[3], 3);
  setProjectData( $("#SceneProject .projectList"), projectListArray[projectTypeIndex], -1);

  $(".projectList").find("li").click(function(){
    var liItemData = $(this).attr('data');
    if ( liItemData === undefined ) return;
    liItemData = JSON.parse( liItemData );
    makeProjectDetail(liItemData);
  });
  setProjectTypeTabCount(projectListCounts, projectTypeIndex);
}

function setProjectData( divObject, dataArray, count ){
  var appendUl = "";
  var prevBro = divObject.prev();
  var prevBroCountSpan = prevBro.find("#mainProjectTypeConut");
  var trtArray = $.merge([],dataArray);
  if (trtArray.length < 1){
    appendUl = "<ul><li><noData>관련 프로젝트가 없습니다.</noData></li></ul>";
    prevBroCountSpan.text("0");
  } else {
    prevBroCountSpan.text(trtArray.length);
    if ( count == -1) count = trtArray.length;
    appendUl = "<ul>"+trtArray.splice(0,count).join("\n")+"</ul>";
  }
  divObject.html(appendUl).trigger("create");
}

function setProjectTypeTabCount( projectListCounts, projectTypeIndex)
{
  $(".projectTypeBtns li").each(function(item, i){
    var liValue = Number( $(this).val() );
    var countArea = $(this).find("small");
    countArea.html("("+projectListCounts[liValue]+")");
    if ( liValue == projectTypeIndex ){
       $(this).css( {"color":"#000000", "background-color":"#99cc00"});
    } else {
        $(this).css( {"color":"inherit", "background-color":"inherit"});
    }
  });
}

function makeProjectDetail(liItemData)
{
  selectItemData = liItemData;
  var isMyProject = ( myData._id === liItemData.pj_registrant._id );
  var isValunteer = false;
  var isProcess = false;
  var volunteersString = "";
  liItemData.pj_volunteer_member.forEach(function(item, i){
    if (isMyProject) volunteersString += "<input type='checkbox' value='"+item._id+"'>";
    volunteersString += setStaffName( item, "hor" )+"<br>";
    if ( item._id === myData._id ) isValunteer = true;
  });
  var processString = "";
  liItemData.pj_progress_member.forEach(function(item, i){
    processString += setStaffName( item, "hor" )+"<br>";
    if ( item._id === myData._id ) isProcess = true;
  });

  var bodyFrame = $("#PopupProjectDetail");

  changeProjectLabels(bodyFrame, Number(liItemData.pj_type._id));

  bodyFrame.find("#DetailProjectId").val(liItemData._id);
  bodyFrame.find("#registrantId").val(liItemData.pj_registrant._id);
  bodyFrame.find("resultTitle").html( "["+setProjectState( (isValunteer && liItemData.pj_state == 0 ) ? 3:liItemData.pj_state )+"] "+liItemData.pj_name );
  bodyFrame.find("type").html(liItemData.pj_type.pjt_name);
  bodyFrame.find("registrant").html( setStaffName(liItemData.pj_registrant, "hor") );
  bodyFrame.find("recruimentDay").html( setDate(liItemData.pj_recruiment_period_day) );
  bodyFrame.find("content").html( setTexts( liItemData.pj_content ) );
  bodyFrame.find("completeDay").html( liItemData.pj_expect_complete_day );
  bodyFrame.find("result").html( setTexts( liItemData.pj_result ) );
  bodyFrame.find("qualification").html( setTexts( liItemData.pj_qualification ) );
  bodyFrame.find("expectationMember").html( setTexts( liItemData.pj_expectation_member_content ) );
  bodyFrame.find("volunteerMember").html( liItemData.pj_volunteer_member.length+"명<br>"+volunteersString );
  bodyFrame.find("volunteerMemberCount").html( liItemData.pj_volunteer_member.length+"명" );
  bodyFrame.find("progressMember").html( liItemData.pj_progress_member.length+"명<br>"+processString );
  bodyFrame.find("rewardAp").html( numberWithCommas(liItemData.pj_reward_ap)+"Ap" );
  bodyFrame.find("dateReg").html( setDate( liItemData.pj_regist_date ) );
  bodyFrame.find("dateStart").html( setDate( liItemData.pj_start_date ) );
  bodyFrame.find("dateEnd").html( setDate( liItemData.pj_end_date ) );
  bodyFrame.find("#selectVolunteerMembersCount").val(liItemData.pj_volunteer_member.length);

  var volunteerMemberLi = bodyFrame.find("#volunteerMemberLi");
  var volunteerMemberCountLi = bodyFrame.find("#volunteerMemberCountLi");
  var progressMemberLi = bodyFrame.find("#progressMemberLi");
  var dateRegLi = bodyFrame.find("#dateRegLi");
  var dateStartLi = bodyFrame.find("#dateStartLi");
  var dateEndLi = bodyFrame.find("#dateEndLi");

  var btnVolunteer = bodyFrame.find("#btnVolunteer");
  var btnVolunteerCancel = bodyFrame.find("#btnVolunteerCancel");
  var btnStart = bodyFrame.find("#btnStart");
  var btnModify = bodyFrame.find("#btnModify");
  var btnDelete = bodyFrame.find("#btnDelete");
  var btnEnd = bodyFrame.find("#btnEnd");

  volunteerMemberLi.hide();
  volunteerMemberCountLi.hide();
  progressMemberLi.hide();
  dateRegLi.hide();
  dateStartLi.hide();
  dateEndLi.hide();

  btnVolunteer.hide();
  btnVolunteerCancel.hide();
  btnStart.hide();
  btnModify.hide();
  btnDelete.hide();
  btnEnd.hide();

  switch( liItemData.pj_state )
  {
    case 0:
      dateRegLi.show();
      volunteerMemberLi.show();
      volunteerMemberCountLi.show();
      if ( isMyProject ){
        btnStart.show();
        btnModify.show();
        btnDelete.show();
      } else {

        if ( isValunteer ){
          btnVolunteerCancel.show();
        } else {
          btnVolunteer.show();
        }
      }
      break;
    case 1:
      progressMemberLi.show();
      dateStartLi.show();

      if ( isMyProject ){
        btnEnd.show();
      }
      break;
    case 2:
      progressMemberLi.show();
      dateStartLi.show();
      dateEndLi.show();
      break;
  }

  bodyFrame.find("input[type=checkbox]").click(function(){
    var selectedValus = bodyFrame.find("#selectVolunteerMembers").val();
    selectedValus = ( selectedValus !== "") ? selectedValus+","+$(this).val() : $(this).val();
    bodyFrame.find("#selectVolunteerMembers").val( selectedValus );
  });

  socket.emit('projectView', {projectId:liItemData._id} );

  $("#PopupProjectDetail").show();
}

function setProjectModifyPage()
{
  var bodyFrame = $("#SceneProjectModifyPage");

  changeProjectLabels(bodyFrame, Number(selectItemData.pj_type._id));

  bodyFrame.find("#ProjectId").val(selectItemData._id);
  bodyFrame.find("#name").val(selectItemData.pj_name);
  bodyFrame.find("#type").val(selectItemData.pj_type._id);
  bodyFrame.find("#pj_recruiment_period_day").val( setDate(selectItemData.pj_recruiment_period_day).split(" ")[0] );
  bodyFrame.find("#content").val( selectItemData.pj_content );
  bodyFrame.find("#pj_expect_complete_day").val(selectItemData.pj_expect_complete_day);
  bodyFrame.find("#result").val( selectItemData.pj_result );
  bodyFrame.find("#pj_qualification").val( selectItemData.pj_qualification );
  bodyFrame.find("#expectationMember").val( selectItemData.pj_expectation_member_content );
  bodyFrame.find("#rewardAp").val( selectItemData.pj_reward_ap );
  bodyFrame.find("#projectTypeResult").html(  selectItemData.pj_type.pjt_name );
}

function checkProjectRegistForm()
{
  var bodyForm = $("#projectRegistForm");
  var errorString = [];

  if ( bodyForm.find("#pj_name").val() === "" ) errorString.push( "프로젝트 이름이 없습니다." );
  if ( bodyForm.find("#pj_type").val() === "" ) errorString.push( "프로젝트 타입이 없습니다." );
  if ( bodyForm.find("#pj_content").val() === "" ) errorString.push( "프로젝트 내용이 없습니다." );
  if ( bodyForm.find("#pj_result").val() === "" ) errorString.push( "프로젝트 예상 결과물이 없습니다." );
  if ( bodyForm.find("#pj_expectation_member_content").val() === "" ) errorString.push( "예상 필요 인원 내용이 없습니다." );
  if ( bodyForm.find("#pj_reward_ap").val() === "" ) errorString.push( "보상 포인트가 없습니다." );

  if ( errorString.length>0 ){
    showErrorMsg("error", "내용을 추가해 주세요", errorString.join("<br>"));
  } else {
    var titleString = "새로운 프로젝트를<br>등록하시겠습니까?";
    var contentString = bodyForm.find("#pj_name").val();
    contentString += "<br>"+numberWithCommas(bodyForm.find("#pj_reward_ap").val())+"Ap";
    showConfirm( titleString , contentString, function(){
      $("#SceneProject").show();
      $("#SceneProjectRegistPage").hide();
      //bodyForm.submit();
      socket.emit('projectCreate', {projectData:formDataToKeyValue( bodyForm )});
    });
  }
}

function checkProjectModifyForm()
{
  var bodyForm = $("#projectModifyForm");
  var errorString = [];

  if ( bodyForm.find("#name").val() === "" ) errorString.push( "프로젝트 이름이 없습니다." );
  if ( bodyForm.find("#type").val() === "" ) errorString.push( "프로젝트 타입이 없습니다." );
  if ( bodyForm.find("#content").val() === "" ) errorString.push( "프로젝트 내용이 없습니다." );
  if ( bodyForm.find("#result").val() === "" ) errorString.push( "프로젝트 예상 결과물이 없습니다." );
  if ( bodyForm.find("#expectationMember").val() === "" ) errorString.push( "예상 필요 인원 내용이 없습니다." );
  if ( bodyForm.find("#rewardAp").val() === "" ) errorString.push( "보상 포인트가 없습니다." );

  if ( errorString.length>0 ){
    showErrorMsg("error", "내용을 추가해 주세요", errorString.join("<br>"));
  } else {
    var titleString = "프로젝트 내용을<br>변경하시겠습니까?";
    var contentString = bodyForm.find("#name").val();
    contentString += "<br>"+numberWithCommas(bodyForm.find("#rewardAp").val())+"Ap";
    showConfirm( titleString , contentString, function(){
      $("#SceneProjectModifyPage").hide();
      $("#SceneProject").show();
      //bodyForm.submit();
      socket.emit('projectModify', {projectData:formDataToKeyValue( bodyForm )});
    });
  }
}

function showConfirm(titleString, contentString, yesFunction)
{
  var popupBody = $('#PopupConfirm');

  popupBody.find("popupTitle").html( titleString );
  popupBody.find("popupContent").html( contentString );

  popupBody.find("#yesButton").bind( "click", yesFunction );
  popupBody.find("#yesButton").bind( "click", function(){
    popupBody.hide();
    $('#PopupConfirm').find("#yesButton").unbind();
  });
  popupBody.find("#noButton").bind( "click", function(){
    popupBody.hide();
    $('#PopupConfirm').find("#noButton").unbind();
  });

  popupBody.show();
}

function initShowConfirm()
{
  var popupBody = $('#PopupConfirm');
  popupBody.find("#yesButton").click(null);
  popupBody.find("#noButton").click(null);
}

function formDataToKeyValue($form){
    var serialized = $form.serializeArray();
    var s = '';
    var data = {};
    for(s in serialized){
        data[serialized[s]['name']] = serialized[s]['value']
    }
    return JSON.stringify(data);
}

function showSceneGift(){
  var maxGiftPt = Number($("#myGiftPoint").text().replace("p","").replace(/,/gi, ""));

  if ( !myData.st_authority.isGift ){
    showErrorMsg("error", "선물 권한이 없습니다.", "관리자에게 문의 바랍니다.");
    return;
  }

  if ( maxGiftPt <= 0 ) {
    showErrorMsg("error", "선물할 포인트가 없습니다.", "더이상 선물할 포인트가 없습니다.<br>선물 가능한 포인트를 혹득한 후 다시 시도해 주세요");
    return;
  }

  hideAllScene();
  //hideAllGiftPage();
  resetGiftValues();
  //$("#SceneGift #PageToStaff").show();
  $("#SceneGift").show();
}
// 네비게이션 버튼 - 선물 내역 클릭 하면
function showSceneHistory(){
  hideAllScene();
  $("#SceneHistory").show();
}

function showSceneProject(){
  hideAllScene();
  $("#SceneProject").show();
}

function showSceneReward(){
  hideAllScene();
  $("#SceneReward").show();
}

function makeRewardList(){
  var appendUl = "";
  var mainUl = "";
  var mainUlCnt = rewardData.length;
  $.each(rewardData, function( index, value ){
    var checkCost = ( tApoint >= Number(value.rd_cost) );

    var appendLi = "<li data='"+JSON.stringify(value)+"' >";
    appendLi += "<name class='"+(( checkCost ) ? "rewardAble":"")+"'>"+value.rd_name+"</name>";
    appendLi += "<cost class='"+(( checkCost ) ? "myPointColor":"")+"'>"+numberWithCommas(value.rd_cost)+"Ap</cost>";
    appendLi += "</li>";
    appendUl += appendLi;
    if ( mainUlCnt === rewardData.length && checkCost ) mainUlCnt = index;
  });
  appendUl = "<ul>"+appendUl+"</ul>";

  $(".rewardListScrollBox").html(appendUl).trigger("create");

  for( var k=0; k<3; k++){
    var inHtml = $(".rewardListScrollBox").find("li:nth-child("+(mainUlCnt+k)+")").html();
    if ( inHtml !== undefined) mainUl += "<li>"+inHtml+"</li>";
  }
  mainUl = "<ul>"+mainUl+"</ul>";

  $("#rewardListMain").html(mainUl);

}

function changeProjectLabels(container, typeIndex)
{
  for( lb=0; lb<2; lb++ )
  {
    container.find(".projectLabel"+lb).hide();
  }
  container.find(".projectLabel"+typeIndex).show();
}

function initProjectRegist()
{
  registPage = $("#SceneProjectRegistPage");
  registPage.find("#pj_name").val("");
  registPage.find("#projectTypes>button:first-child").trigger("click");
  registPage.find("#pj_recruiment_period_day").val("");
  registPage.find("#pj_content").val("");
  registPage.find("#pj_expect_complete_day").val("");
  registPage.find("#pj_result").val("");
  registPage.find("#pj_qualification").val("");
  registPage.find("#pj_expectation_member_content").val("");
  registPage.find("#pj_reward_ap").val("");
}
