"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activityLog_controller_1 = require("../controllers/activityLog.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All activity log routes require Admin access
router.use(auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeRoles)('Admin'));
router.get('/', activityLog_controller_1.ActivityLogController.getAll);
router.get('/recent', activityLog_controller_1.ActivityLogController.getRecent);
router.get('/actions', activityLog_controller_1.ActivityLogController.getActions);
router.get('/user/:userId', activityLog_controller_1.ActivityLogController.getByUser);
router.delete('/clear-old', activityLog_controller_1.ActivityLogController.clearOldLogs);
exports.default = router;
