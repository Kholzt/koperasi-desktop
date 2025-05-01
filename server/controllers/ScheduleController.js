import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from "../config/db.js";

export default class ScheduleController {
  static async index(req, res) {
    try {
      const { page = 1, limit = 10 ,area = "" ,group = ""} = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const [rows] = await db.query(
        "SELECT `schedule`.id,day,`schedule`.status,`groups`.id as group_id,`groups`.group_name,`areas`.id as area_id,`areas`.area_name FROM `schedule` JOIN areas ON `schedule`.`area_id` = areas.id JOIN `groups` ON `schedule`.`group_id` = `groups`.id WHERE `schedule`.deleted_at is null ORDER BY `schedule`.id  DESC LIMIT ? OFFSET ?",
        [parseInt(limit), offset]
      );

      const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM `schedule` WHERE deleted_at is null');

      // Grouping
      const map = new Map();
      for (const row of rows) {
        if (!map.has(row.id)) {
          map.set(row.id, {
            id: row.id,
            day: row.day,
            status: row.status,
            area: {
              id: row.area_id,
              area_name: row.area_name
            },
            group: {
              id: row.group_id,
              group_name: row.group_name
            },
          });
        }
      }

      const schedule = Array.from(map.values());
      res.status(200).json({
        schedule,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Menampilkan detail area berdasarkan ID
  static async show(req, res) {
    try {
      const { id } = req.params;
      const [schedule] = await db.query(
        'SELECT * FROM `schedule` WHERE id = ?',
        [id]
      );
      if (!schedule || schedule.length === 0) {
        return res.status(404).json({ error: 'Schedule tidak ditemukan' });
      }
      res.status(200).json({
        schedule: schedule[0],
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while retrieving the area.' });
    }
  }

  // Menyimpan area baru dengan validasi dan enkripsi password
  static async store(req, res) {
    // Validasi input menggunakan express-validator
    await body('area_id').notEmpty().withMessage('Wilayah wajib diisi').run(req);
    await body('group_id').notEmpty().withMessage('Kelompok wajib diisi').run(req);
    await body('day').notEmpty().withMessage('Hari wajib diisi').run(req);
    await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status must be active or inactive').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg; // key = field name, value = error message
            return acc;
        }, {});

      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { area_id,group_id,day, status } = req.body;

      // Cek apakah area sudah ada di database
      const [areaByScheduleName] = await db.query('SELECT * FROM `schedule` JOIN areas ON `schedule`.`area_id` = areas.id JOIN `groups` ON `schedule`.`group_id` = `groups`.id WHERE `schedule`.area_id = ? AND `schedule`.group_id = ? AND day = ? ', [area_id,group_id,day]);
      if (areaByScheduleName.length > 0) {
        return res.status(409).json({ error: `Jadwal konflik dengan kelompok ${areaByScheduleName[0].group_name}  di wilayah ${areaByScheduleName[0].area_name} pada hari ${day} ` });
      }


      // Insert data area baru ke database
      const result = await db.query(
        'INSERT INTO `schedule` (area_id,group_id,day, status) VALUES (?, ?, ?, ?)',
        [area_id, group_id, day, status]
      );

      // Ambil data area yang baru saja dimasukkan
      const newSchedule = await db.query('SELECT * FROM `schedule` WHERE id = ?', [result.insertId]);

      res.status(201).json({
        message: 'Schedule berhasil dibuat',
        area: newSchedule[0], // Mengembalikan data area yang baru saja dibuat
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the area.' + error.message });
    }
  }

  // Mengupdate data area dengan pengecekan dan enkripsi password jika ada perubahan
  static async update(req, res) {
    // Validasi input menggunakan express-validator
    await body('area_id').notEmpty().withMessage('Wilayah wajib diisi').run(req);
    await body('group_id').notEmpty().withMessage('Kelompok wajib diisi').run(req);
    await body('day').notEmpty().withMessage('Hari wajib diisi').run(req);
    await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status must be active or inactive').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg; // key = field name, value = error message
            return acc;
        }, {});

      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { id } = req.params;
      const { area_id,group_id,day, status } = req.body;

      const [existingSchedule] = await db.query('SELECT * FROM `schedule` WHERE id = ?', [id]);
      if (!existingSchedule || existingSchedule.length === 0) {
        return res.status(404).json({ error: 'Schedule tidak ditemukan' });
      }

      const [areaByScheduleName] = await db.query('SELECT * FROM `schedule` JOIN areas ON `schedule`.`area_id` = areas.id JOIN `groups` ON `schedule`.`group_id` = `groups`.id WHERE `schedule`.area_id = ? AND `schedule`.group_id = ? AND day = ? AND `schedule`.id <> ?', [area_id,group_id,day, id]);
      if (areaByScheduleName.length > 0) {
        return res.status(409).json({ error: `Jadwal konflik dengan kelompok ${areaByScheduleName[0].group_name}  di wilayah ${areaByScheduleName[0].area_name} pada hari ${day} ` });
      }

      // Jika password diberikan, enkripsi password sebelum update
      let updateData = [area_id,group_id,day, status,id];

      await db.query(
        "UPDATE `schedule` SET area_id = ?, group_id = ?, day = ?, status = ?  WHERE id = ?",
        updateData
      );

      res.status(201).json({ message: 'Schedule updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the area.'+error.message });
    }
  }


    // Menampilkan detail area berdasarkan ID
    static async delete(req, res) {
        try {
          const { id } = req.params;
          const [area] = await db.query(
            'SELECT * FROM `schedule` WHERE id = ?',
            [id]
          );
          if (!area || area.length === 0) {
            return res.status(404).json({ error: 'Schedule tidak ditemukan' });
          }

          await db.query(
            "UPDATE `schedule` SET deleted_at = ? WHERE id = ${id}",
            new Date()
          );
          res.status(200).json({
            area: area[0],
          });
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while retrieving the area.' });
        }
      }
}
