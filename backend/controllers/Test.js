const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const generateText = async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(req.body.prompt);
        console.log(req.body);
        const response = result.response;
        const data = response.text();
        res.status(200).json({ message: "Data fetched from api", data });



    } catch (error) {
        console.log("Error found", error);

    }

}
module.exports = generateText;
