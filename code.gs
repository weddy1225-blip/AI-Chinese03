/* 核心後端：將 GAS 作為 API 提供給 GitHub 前端呼叫
*/

function doGet(e) {
  // 處理來自 GitHub 的 API 請求
  if (e.parameter.action === 'getQuestion') {
    const res = getAIResponse('QUESTION');
    return ContentService.createTextOutput(res).setMimeType(ContentService.MimeType.TEXT);
  }
  
  if (e.parameter.action === 'getFeedback') {
    const res = getFeedback(e.parameter.sentence, e.parameter.color, e.parameter.reason);
    return ContentService.createTextOutput(res).setMimeType(ContentService.MimeType.TEXT);
  }

  // 預設返回 HTML 介面（供 GAS 內部測試使用）
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('🎨 文字調色盤 - 小小特派員')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getAIResponse(promptType, context = {}) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) return "錯誤：找不到 API KEY。";

  // 使用 Gemma 4 作為首選模型
  const modelList = ["gemma-4-26b", "gemini-2.5-flash"];
  
  for (let modelName of modelList) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    let prompt = "";
    
    if (promptType === 'QUESTION') {
      prompt = `你是一位國小老師。為四年級學生寫一個約30字的優美句子。主題隨機：微觀世界、抽象心情或奇幻想像。絕對禁止出現顏色詞，直接輸出句子。`;
    } else {
      prompt = `句子：${context.sentence} \n學生選色：${context.color} \n理由：${context.reason}
      任務：扮演溫柔的老師點評。要求：不要成語。結構：【亮點】：描述有充分表達意境的部分。【小建議】：描述未充分展現的部分。語氣溫暖，禁冒號。`;
    }

    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      muteHttpExceptions: true
    };

    try {
      const response = UrlFetchApp.fetch(url, options);
      const resData = JSON.parse(response.getContentText());
      if (response.getResponseCode() === 200 && resData.candidates) {
        return resData.candidates[0].content.parts[0].text;
      }
    } catch (e) { continue; }
  }
  return "老師還在準備中，請稍後。";
}

function getFeedback(s, c, r) { return getAIResponse('FEEDBACK', {sentence: s, color: c, reason: r}); }
