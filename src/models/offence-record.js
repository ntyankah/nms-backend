import mongoose from 'mongoose';
import { vehicleTypes } from '../constants/vehicle-types.js';
import { releaseReasons } from '../constants/release-reasons.js';

const offenceRecordSchema = new mongoose.Schema({
  truckNo: { type: String, required: true },
  vehicleType: { type: String, required: true, enum: [...Object.values(vehicleTypes)]},
  arrestDate: { type: Date, required: true },
  offence: {type: String, required: true},
  companyName: {type: String, required: true},
  officer: {type: String, required: true},

  releaseDate: { type: Date, default: null },
  releaseReason: {type: [String], enum: [...Object.values(releaseReasons)] , default: null},
  salesReceipt: {type: String , default: null},
  penaltyReceipt: {type: String , default: null},
  administrativeReceipt: {type: String , default: null},
  salesAmount: {type: Number , default: null},
  penaltyAmount: {type: Number , default: null},
  administrativeAmount: {type: Number , default: null},
  resolvedReason: {type: String , default: null},
}, { timestamps: true });

const OffenceRecord = mongoose.model('OffenceRecord', offenceRecordSchema);
export default OffenceRecord;