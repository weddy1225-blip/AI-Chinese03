function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('🎨 文字調色盤')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getQuestion() {
  const sentences = [
    "清晨的露珠躺在嫩葉中央，倒映著整座還沒醒來的森林。",
    "小螞蟻吃力地搬著一顆砂糖，那是牠準備過冬的甜蜜寶藏。",
    "沙灘上的貝殼被海浪洗得亮晶晶，裡頭藏著大海說不完的秘密。",
    "指甲蓋大小的瓢蟲，背著重重的圓形書包，在花瓣階梯上漫步。",
    "溪水裡的鵝卵石被磨得圓圓滑滑，摸起來就像溫暖的羊毛。",
    "一陣大雨過後，空氣裡充滿了淡淡的泥土芬芳與青草的氣息。",
    "星星在夜空中不停地眨眼睛，好像在向地上的我們打招呼。"
  ];
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function getFeedback(sentence, color, reason) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
  
  const prompt = `你是一位溫柔的色彩心理老師。學生讀了「${sentence}」選了色碼「${color}」，理由是「${reason || "（未提供）"}」。
  
  請撰寫點評並分為兩段（中間請換行）：
  1. 第一段：分析這個顏色與文字意象的呼應。
  2. 第二段：闡述這個選擇與「大眾認定」的顏色有何不同，給予鼓勵。
  
  要求：適合四年級，嚴格禁止用冒號。約150字。`;

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      muteHttpExceptions: true
    });
    
    const resText = JSON.parse(response.getContentText()).candidates[0].content.parts[0].text;
    return resText;
  } catch (e) {
    return "老師正在細細品味你的色彩選擇，請稍後點擊「重新整理」或再點一次提交喔！";
  }
}
