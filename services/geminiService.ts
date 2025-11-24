import { GoogleGenAI } from "@google/genai";
import { StudentSettlement } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateParentMessage = async (settlement: StudentSettlement): Promise<string> => {
  const client = getAIClient();
  if (!client) return "错误: 缺少 API Key 配置。";

  const prompt = `
    Role: You are a polite and professional administrator at a tutoring center.
    Task: Write a short, friendly Wechat message to a parent detailing the tuition settlement for this month.
    
    Data:
    Student: ${settlement.student.name}
    Month: ${settlement.month}
    Total Amount: ¥${settlement.totalAmount}
    Details:
    ${settlement.items.map(i => `- ${i.subject}: ${i.totalHours} 课时 @ ¥${i.pricePerHour}/课时 + 课本费: ¥${i.materialFeeTotal}`).join('\n')}
    
    Instructions:
    - Start with a polite greeting.
    - Clearly state the total.
    - Briefly summarize the classes.
    - End with a thank you.
    - Language: Chinese (Simplified).
    - Keep it concise.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "无法生成消息。";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "生成消息失败，请检查 API 配置。";
  }
};

export const analyzeFinancials = async (settlements: StudentSettlement[]): Promise<string> => {
    const client = getAIClient();
    if (!client) return "未配置 API Key，无法使用分析功能。";

    const summary = settlements.map(s => `${s.student.name}: ¥${s.totalAmount} (${s.items.map(i => i.subject).join(', ')})`).join('\n');

    const prompt = `
      Analyze the following tuition data for a tutoring center.
      Identify:
      1. Top revenue generating subjects.
      2. Any students with unusually high or low hours.
      3. A brief strategic tip for next month.
      
      Data:
      ${summary}

      Output Language: Chinese (Simplified).
      Output as a Markdown formatted list.
    `;

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "暂无分析结果。";
    } catch (error) {
        return "分析失败。";
    }
}