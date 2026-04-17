"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
class Orchestrator {
    constructor(router, communicator) {
        this.app = (0, express_1.default)();
        this.router = router;
        this.communicator = communicator;
        this.setupRoutes();
    }
    setupRoutes() {
        this.app.use(express_1.default.json());
        // Serve static dashboard
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
        this.app.post('/orchestrate', (req, res) => {
            const { action, target, payload } = req.body;
            console.log(`Orchestrating action: ${action} for ${target}`);
            this.communicator.send(target, { type: action, data: payload });
            res.json({ status: 'dispatched', timestamp: new Date().toISOString() });
        });
        this.app.listen(3000, () => console.log('Orchestrator API running on port 3000'));
    }
}
exports.Orchestrator = Orchestrator;
