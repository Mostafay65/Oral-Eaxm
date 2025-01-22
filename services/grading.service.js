const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const gradeQuestion = async (question, correctAnswer, studentAnswer) => {
    const prompt = `Question: ${question}\nCorrect Answer: ${correctAnswer}\nStudent's Answer: ${studentAnswer}\nPlease grade the student's answer based on the correct answer and respond with only a numerical score out of 10 (e.g., '9').`;
    const result = await model.generateContent(prompt, { temperature: 0.0 }); // Set the temperature to a low value for deterministic responses
    
    // make sure the answer is a number between 0 and 10
    return result.response.text();
};

module.exports = { gradeQuestion };

/*  
    prompt: 
            Question: <question>
            Correct Answer: <correctAnswer>
            Student's Answer: <studentAnswer>
            Please grade the student's answer based on the correct answer and respond with only a numerical score out of 10 (e.g., '9').
*/
