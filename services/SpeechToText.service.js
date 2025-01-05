const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const transcribe = async (filePath) => {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);

    formData.append("audio", fileStream);

    const response = await axios.post(
        process.env.SPEECH_TO_TEXT_API_HOST,
        formData,
        {
            headers: {
                ...formData.getHeaders(),
            },
        }
    );

    return response.data;
};

module.exports = transcribe;
