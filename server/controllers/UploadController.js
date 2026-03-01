export async function uploadProfileController(req, res) {
    console.log(req.file);
    try {
        if (!req.file) {
            return res.status(400).json({
                message: 'File tidak terkirim',
            });
        }

        return res.status(200).json({
            message: 'Upload berhasil',
            imageUrl: `/uploads/profiles/${req.file.filename}`,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Upload gagal',
            error: error.message,
        });
    }
}