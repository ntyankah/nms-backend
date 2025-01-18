import { releaseReasons } from '../constants/release-reasons.js';
import OffenceRecord from '../models/offence-record.js';

// Create a new offence record
export const createOffenceRecordDraft = async (req, res) => {
  const { truckNo, vehicleType, arrestDate, offence, companyName, officer } = req.body;
  const offenceRecord = new OffenceRecord({truckNo, vehicleType, arrestDate, offence, companyName, officer});
  const savedRecord = await offenceRecord.save();
  res.status(201).json(savedRecord);
};

// mark offence record as completed
export const markOffenceRecordCompleted = async (req, res) => {
    const { 
        releaseDate, 
        releaseReason, 
        salesReceipt, 
        salesAmount, 
        penaltyAmount, 
        penaltyReceipt,
        administrativeAmount,
        administrativeReceipt,
    } = req.body;
    const {id: _id} = req.params
    const offenceRecord = await OffenceRecord.findById(_id);
    if(releaseReason.includes(releaseReasons.sales)) {
        offenceRecord.salesAmount = salesAmount
        offenceRecord.salesReceipt = salesReceipt 
    }

    if(releaseReason.includes(releaseReasons.penalty)) {
        offenceRecord.penaltyAmount = penaltyAmount
        offenceRecord.penaltyReceipt = penaltyReceipt
    }

    if(releaseReason.includes(releaseReasons.administrativeCharge)) {
        offenceRecord.administrativeAmount = administrativeAmount
        offenceRecord.administrativeReceipt = administrativeReceipt
    }

    offenceRecord.releaseReason = releaseReason
    offenceRecord.releaseDate = releaseDate

    const savedRecord = await offenceRecord.save();
    res.status(201).json(savedRecord);
};

// Get all offence records
export const getAllOffenceRecords = async (req, res) => {
  const offenceRecords = await OffenceRecord.find();
  res.status(200).json(offenceRecords);
};

// Get all draft records
export const getAllDraftRecords = async (req, res) => {
    const offenceRecords = await OffenceRecord.find({releaseDate: null});
    res.status(200).json(offenceRecords);
};

// Get all completed records
export const getAllCompletedRecords = async (req, res) => {
    const offenceRecords = await OffenceRecord.find({releaseDate: { $ne: null }});
    res.status(200).json(offenceRecords);
};

// Delete a offence record by ID
export const deleteOffenceRecord = async (req, res) => {
    console.log('Entered the delete records function')
    try {
        const { id } = req.params;
        const deletedRecord = await OffenceRecord.findByIdAndDelete(id);
    
        if (!deletedRecord) {
          return res.status(404).json({ message: 'Record not found' });
        }
        res.status(200).json({ message: 'Record deleted successfully' });
      } catch (error) {
        console.error('Error deleting record:', error.message);
        res.status(500).json({ message: 'Error deleting record', error: error.message });
      }
    
};