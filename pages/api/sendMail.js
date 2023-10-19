import { sendMail } from "./mailService/mailService";
const handler = async (req, res) => {
  try {
    await sendMail(
      req.body.subject,
      req.body.toEmail,
      req.body.message
    );
    res.status(200).send("Success");
  } catch (err) {
    res.status(400).json({
      error_code: "api_one",
      message: err.message,
    });
  }
};

export default handler;
