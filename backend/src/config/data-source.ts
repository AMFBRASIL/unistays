import { DataSource } from 'typeorm';
import { dataSourceOptions } from './database';

export default new DataSource(dataSourceOptions);
