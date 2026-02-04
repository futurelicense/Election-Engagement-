import 'dotenv/config';
import serverless from 'serverless-http';
import { createApp } from '../backend/src/app';

const app = createApp();
export default serverless(app);
