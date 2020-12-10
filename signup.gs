//通信//
function doPost(e) {
  var mail = e.parameter.mail;
  var password = e.parameter.password;
  var checkResultStr = checkInput(mail, password);
  
  if(checkResultStr == "") {
    // 成功 登録処理 成功メッセージ
    var registrationExecution = dataRegistration(mail, password);
    registrationExecution;
    var json = {"result":"OK", "okMessage":"登録が完了しました" }
  }
    // 失敗 エラーメッセージ
  else {
    var json = {"result":"NG", "ngMessage":checkResultStr }
  }
  
  var json_text = JSON.stringify(json);
  var response = ContentService.createTextOutput();
  response.setMimeType(ContentService.MimeType.JSON);
  response.setContent(json_text);
  return response;
}


//入力項目エラーチェック//
function checkInput(mail, password) {
  
  // mailが入力されているか
  if (mail == "") {
    var json = "メールアドレスが入力されていません"
    return json;
  }
  
  // 入力されたmail addressの書式は正しいか
  if (!mail.match(/^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]{1,}\.[A-Za-z0-9]{1,}$/)){
    var json = "メールアドレスが正しくありません。半角英数字で入力してください"
    return json;
  }
  
  // 入力されたmail addressは既に登録されていないか
  var sheet = SpreadsheetApp.getActiveSheet();
  var mailFinder = sheet.createTextFinder(mail)
  var ranges = mailFinder.findAll();
  if (ranges == 1){
    var json = "このメールアドレスは既に使用されています"
    return json;
  }

  // passwordが入力されているか
  if (password == ""){
    var json = "パスワードが入力されていません"
    return json;
  }
  
  // 入力されたpasswordは8文字以上になっているか
  if (password.length < 8 || password.length > 16){
    var json = "パスワードは8文字以上16文字以下で入力してください"
    return json;
  }
  
  // 入力されたpasswordは半角英数字で入力されているか
  if (!password.match(/^[A-Za-z0-9]*$/)){
    var json = "半角英数字で入力してください"
    return json;
  }
  
  // 入力されたpasswordは英数字が混在しているか
  if (!password.match(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,16}$/)){
    var json = "半角の大文字小文字と数字をそれぞれ含んでください"
    return json;
  }
  
  // 成功
  else {
    var json = ""
    return json;
  }
}


//スプレッドシート登録 passwordハッシュ化//
function dataRegistration(mail, password) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var date = new Date();
  var secret = "my_secret";
  var signature = Utilities.computeHmacSha256Signature(password, secret);
  var hashedPassword = signature.reduce(function(str,chr){
    chr = (chr < 0 ? chr + 256 : chr).toString(16);
    return str + (chr.length==1?'0':'') + chr;
  },'');
    var lastRowA = sheet.getRange(sheet.getMaxRows(), 1).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
    var sheetResult = sheet.getRange(lastRowA + 1,1,1,3).setValues([ [date, mail, hashedPassword] ]);
}