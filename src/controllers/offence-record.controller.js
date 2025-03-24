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
        resolvedReason
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

    if(releaseReason.includes(releaseReasons.resolved)) {
        offenceRecord.resolvedReason = resolvedReason
    }

    offenceRecord.releaseReasons = releaseReason
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

// Add the analytics controller
export const getAnalytics = async (req, res) => {
    try {
        // Fetch all offence records
        const offenceRecords = await OffenceRecord.find();

        // Analysis function from previous response
        const analyzeTruckData = (documents) => {
            const analysis = {
                combinedTotals: {
                    administrativeAmount: 0,
                    penaltyAmount: 0,
                    salesAmount: 0
                },
                truckStatus: {
                    pending: 0,
                    completed: 0
                },
                quarterly: {
                    Q1: { salesAmount: 0, penaltyAmount: 0, administrativeAmount: 0 },
                    Q2: { salesAmount: 0, penaltyAmount: 0, administrativeAmount: 0 },
                    Q3: { salesAmount: 0, penaltyAmount: 0, administrativeAmount: 0 },
                    Q4: { salesAmount: 0, penaltyAmount: 0, administrativeAmount: 0 }
                },
                transactionCounts: {
                    penalty: 0,
                    sales: 0,
                    administrative: 0
                },
                monthlyAnalytics: {},
                recentModifications: []
            };

            documents.forEach(doc => {
                // Combined totals
                analysis.combinedTotals.administrativeAmount += doc.administrativeAmount || 0;
                analysis.combinedTotals.penaltyAmount += doc.penaltyAmount || 0;
                analysis.combinedTotals.salesAmount += doc.salesAmount || 0;

                // Truck status
                if (doc.releaseDate === null) {
                    analysis.truckStatus.pending += 1;
                } else {
                    analysis.truckStatus.completed += 1;
                }

                // Quarterly analysis
                if (doc.arrestDate) {
                    const arrestDate = new Date(doc.arrestDate);
                    const quarter = Math.ceil((arrestDate.getMonth() + 1) / 3);
                    const quarterKey = `Q${quarter}`;
                    
                    analysis.quarterly[quarterKey].salesAmount += doc.salesAmount || 0;
                    analysis.quarterly[quarterKey].penaltyAmount += doc.penaltyAmount || 0;
                    analysis.quarterly[quarterKey].administrativeAmount += doc.administrativeAmount || 0;
                }

                // Transaction counts
                if (doc.penaltyAmount) analysis.transactionCounts.penalty += 1;
                if (doc.salesAmount) analysis.transactionCounts.sales += 1;
                if (doc.administrativeAmount) analysis.transactionCounts.administrative += 1;

                // Monthly analytics
                const arrestDate = new Date(doc.arrestDate);
                const monthKey = arrestDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                
                if (!analysis.monthlyAnalytics[monthKey]) {
                    analysis.monthlyAnalytics[monthKey] = {
                        sales: { total: 0, entries: 0 },
                        penalty: { total: 0, entries: 0 },
                        administrative: { total: 0, entries: 0 },
                        releasedWithNoAmount: 0
                    };
                }

                const monthly = analysis.monthlyAnalytics[monthKey];
                if (doc.salesAmount) {
                    monthly.sales.total += doc.salesAmount;
                    monthly.sales.entries += 1;
                }
                if (doc.penaltyAmount) {
                    monthly.penalty.total += doc.penaltyAmount;
                    monthly.penalty.entries += 1;
                }
                if (doc.administrativeAmount) {
                    monthly.administrative.total += doc.administrativeAmount;
                    monthly.administrative.entries += 1;
                }
                if (doc.releaseDate && !doc.salesAmount && !doc.penaltyAmount && !doc.administrativeAmount) {
                    monthly.releasedWithNoAmount += 1;
                }
            });

            // For recent modifications, using updatedAt if available, otherwise arrestDate
            analysis.recentModifications = documents
                .sort((a, b) => {
                    const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.arrestDate);
                    const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.arrestDate);
                    return dateB - dateA;
                })
                .slice(0, 5)
                .map(doc => ({
                    truckNo: doc.truckNo,
                    arrestDate: doc.arrestDate,
                    offence: doc.offence,
                    modifiedAt: doc.updatedAt || doc.arrestDate
                }));

            return analysis;
        };

        // Get analytics data
        const analyticsData = analyzeTruckData(offenceRecords);

        // Return successful response
        res.status(200).json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Error fetching analytics:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};
