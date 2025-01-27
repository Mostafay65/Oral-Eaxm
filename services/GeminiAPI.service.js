const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const gradeQuestion = async (question, correctAnswer, studentAnswer) => {
    const prompt = `
                    Question: ${question}
                    Correct Answer: ${correctAnswer}
                    Student's Answer: ${studentAnswer}
                    Please grade the student's answer based on the correct answer and respond with only a numerical score out of 10 (e.g., '9').
                    `;
    const result = await model.generateContent(prompt, { temperature: 0.0 }); // Set the temperature to a low value for deterministic responses

    // make sure the answer is a number between 0 and 10
    return result.response.text();
};

const feedback = async (answers, exam) => {
    let prompt = `
                    Good evening, we have a student who took an exam "${exam.title}"
                    This exam consists of several questions.
                    
                    Based on the student's answers in this exam, I want you to write feedback for this student, advising them what to study and how to strengthen their knowledge for this exam in the future, and inform them of the correct answers.
                    Make sure to keep the tone encouraging and positive so the student doesn't feel disheartened by their result in this exam. End the feedback with a heartfelt prayer for the student's success and good fortune in future exams.
                    Please respond in Egyptian Arabic dialect only, without any additional text just the feedback itself.
                    `;

    for (const answer of answers) {
        const question = `

                    question “${answer.questionText}”
                    Correct answer “${answer.answerText}”
                    student's answer “${answer.studentAnswer}”
                    ------------------------------------------------
        `;
        prompt += question;
    }

    const result = await model.generateContent(prompt);
    return result.response.text();
};

module.exports = { gradeQuestion, feedback };
