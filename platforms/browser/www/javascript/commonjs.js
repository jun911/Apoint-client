// 숫자에 3자리 마다 , 찍기
function numberWithCommas(x) {
  if ( x === null ) x = 0;
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/*
* 필터
* root 기본 라인
* target 기본 라인의 어떤걸 기준으로
* key 검색 키
*/
function filter(root,target,key,whole){
  if ( whole === undefined ) whole = false;
  $root = $(root);
  $root.each(function(i,item){
    var chkValue = $(item).find(target)[0].innerHTML;
    if ( (whole && chkValue === key) || (!whole && (chkValue.indexOf(key) > -1)) ) {
      $(item).show();
    } else {
      $(item).hide();
    }
  });
  resetMainCheckBox();
}

String.prototype.toKorChars = function() {
    var cCho  = [ 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ],
        cJung = [ 'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ' ],
        cJong = [ '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ' ],
        cho, jung, jong;

    var str = this,
        cnt = str.length,
        chars = [],
        cCode;

    for (var i = 0; i < cnt; i++) {
        cCode = str.charCodeAt(i);

        if (cCode == 32) { continue; }

        // 한글이 아닌 경우
        if (cCode < 0xAC00 || cCode > 0xD7A3) {
            chars.push(str.charAt(i));
            continue;
        }

        cCode  = str.charCodeAt(i) - 0xAC00;

        jong = cCode % 28; // 종성
        jung = ((cCode - jong) / 28 ) % 21; // 중성
        cho  = (((cCode - jong) / 28 ) - jung ) / 21; // 초성

        chars.push(cCho[cho], cJung[jung]);
        if (cJong[jong] !== '') { chars.push(cJong[jong]); }
    }

    return chars;
};

function getAllChildFromTeam( gTeamTree, teamId, childString )
{
  for( var t=0; t<gTeamTree.length; t++ )
  {
    var chkTeam = gTeamTree[t];
    if ( Number(teamId) !== Number(chkTeam) )
    {
      childString += getAllChildFromTeam( teamTree[chkTeam], chkTeam, "" );
    }
  }
  childString += teamId+",";
  return childString;
}

function setStaffName( dataObj, direction )
{
  if ( direction === undefined ) direction = "ver";

  var directionString = ( direction == "ver" ) ? "<br>":" ";

  var returnString = "";
  returnString += "<small>"+dataObj.st_team.t_name+"</small>"+directionString;
  returnString += dataObj.st_name+directionString;
  returnString += ( dataObj.st_job.j_name == "-" ) ? dataObj.st_rank.r_name : dataObj.st_job.j_name;

  return returnString;
}

function setDate( dateObj )
{
  var returnString = "";

  if ( dateObj === null || dateObj === undefined ) return returnString;

  var setDt = new Date( dateObj );
  returnString += setDt.getFullYear()+"-"+(("0" + (setDt.getMonth() + 1)).slice(-2))+"-"+(("0" + setDt.getDate()).slice(-2));
  returnString += " " + ("0" + setDt.getHours()).slice(-2)+":"+("0" + setDt.getMinutes()).slice(-2);
  return returnString;
}

function setProjectState( stateNumber )
{
  switch( stateNumber )
  {
    case 0:
      return "모집중";
    case 1:
      return "진행중";
    case 2:
      return "완료";
    case 3:
      return "지원중";
    case 99:
      return "삭제";
    default:
      return "";
  }
}

function setTexts( getString )
{
  var returnString = "";

  if ( getString !== undefined ) returnString = getString.replace(/\r\n/gi, "<br>");

  return returnString;
}
