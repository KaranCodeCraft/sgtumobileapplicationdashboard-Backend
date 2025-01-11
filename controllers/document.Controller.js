const documentupload = async (req, res) => {
    res.status(200).json({message: "Document uploaded successfully"});
}
const documentview = async (req, res) => {
    res.status(200).json({message: "Document View successfully"});
}
module.exports = { documentupload, documentview };