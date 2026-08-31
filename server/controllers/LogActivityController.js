import { ACTIVITY_MENU } from "../constants/activityConstant";
import ActivityModel from "../models/Activity";

export default class LogActivityController {
    static async index(req, res) {
        try {
            let {
                page = 1, limit = 10, search = '', menu = '', pos = null
            } = req.query;

            const user = req.user;
            if (!['pusat', 'controller'].includes(user.role)) {
                pos = user.pos_id;
            }

            const {
                rows,
                total
            } = await ActivityModel.findAll({
                page,
                limit,
                search,
                menu,
                pos
            });

            const map = new Map();
            for (const row of rows) {
                if (!map.has(row.id)) {
                    map.set(row.id, {
                        ...row,
                        // penanggungJawab: {
                        //     complete_name: row.complete_name
                        // },
                    });
                }
            }

            res.status(200).json({
                activity: Array.from(map.values()),
                pagination: {
                    total,
                    page: +page,
                    limit: +limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    static async show(req, res) {
        try {
            const {
                id
            } = req.params;
            const rows = await ActivityModel.findById(id);

            if (!rows.length) return res.status(404).json({
                error: 'Tidak ada aktivitas ditemukan'
            });

            const pos = {
                ...rows[0],
                // penanggungJawab: {
                //     complete_name: rows[0].complete_name
                // },
            };

            res.status(200).json({
                pos
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    static async getMenu(req, res) {
        try {
            const menu = await ACTIVITY_MENU;
            res.status(200).json({
                menu
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
}