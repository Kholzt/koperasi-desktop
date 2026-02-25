import ActivityModel from "../../models/Activity";

export async function logActivity({
    user,
    action,
    menu,
    entityReff,
    entityId,
    description = '',
    oldValue = null,
    newValue = null,
    posId = null
}) {
    try {
        await ActivityModel.create({
            user_id: user.id,
            action,
            menu,
            entity_reff: entityReff,
            entity_id: entityId,
            description,
            old_data: oldValue ? JSON.stringify(oldValue) : null,
            new_data: newValue ? JSON.stringify(newValue) : null,
            pos_id: user.pos_id ?? posId,
            created_at: new Date()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}