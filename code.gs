function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('🎨 文字調色盤')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 接收來自 GitHub 網頁的 POST 請求
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const feedback = getFeedback(data.sentence, data.color, data.reason);
    return ContentService.createTextOutput(JSON.stringify({ "feedback": feedback }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "feedback": "系統連線異常，請檢查 API 設定。" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getFeedback(sentence, color, reason) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  
  const prompt = `你是一位溫柔的國小老師。學生讀了句子「${sentence}」後選了色碼「${color}」，理由是「${reason}」。
  請撰寫點評（約 150 字，分兩段）：
  1. 具體稱讚學生如何將色彩與文字意像連結。
  2. 鼓勵學生的想像力。
  語氣要像對四年級小孩說話，絕對不要出現任何冒號或引號。`;

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  
  const json = JSON.parse(response.getContentText());
  return json.candidates[0].content.parts[0].text;
}
