// routes/userRoutes.js
import express from 'express';
import { body, param } from 'express-validator';
import { createOffenceRecordDraft,
    markOffenceRecordCompleted,
    getAllOffenceRecords,
    getAllDraftRecords,
    getAllCompletedRecords,
    deleteOffenceRecord,
    getAnalytics
} from '../controllers/offence-record.controller.js';
import { handleValidationErrors } from '../middleware/validation.middleware.js';
import { vehicleTypes } from '../constants/vehicle-types.js';
import { releaseReasons } from '../constants/release-reasons.js';

const router = express.Router();

router.post(
  '/draft',
  [
    body('truckNo').not().isEmpty().withMessage('truckNo is required'),
    body('vehicleType').isIn(Object.values(vehicleTypes)).withMessage('provide a valid vehicle type'),
    body('arrestDate').isDate().withMessage('Provide a valid date as arrestDate'),
    body('offence').not().isEmpty().withMessage('Offence reason is required'),
    body('companyName').not().isEmpty().withMessage('Company name is required'),
    body('officer').not().isEmpty().withMessage('arresting officer is required'),
  ],
  handleValidationErrors,
  createOffenceRecordDraft
);

router.post(
  '/complete/:id',
  [
    param('id').isMongoId().withMessage('Invalid Record ID'),
    body('releaseDate').isDate().withMessage('Provide a valid date as release date'),

    body('releaseReason')
        .isArray()
        .withMessage('releaseReasons must be an array')
        .custom((values) => {
        const validReasons = [...Object.values(releaseReasons)];
        return values.every((reason) => validReasons.includes(reason));
        })
        .withMessage('Invalid value in releaseReasons'),

    body('salesAmount')
        .custom((value, { req }) => {
            const includesSales = req.body.releaseReason?.includes(releaseReasons.sales);
            if (includesSales && (value === undefined || value === null || isNaN(value) || typeof value !== 'number')) {
              return false
            }
            return true;
          })
        .withMessage('salesAmount is required when releaseReasons includes "sales"'),
    
    body('penaltyAmount')
        .custom((value, { req }) => {
            if (req.body.releaseReason?.includes(releaseReasons.penalty) && (value === undefined || value === null || isNaN(value) || typeof value !== 'number')) {
              return false
            }
            return true;
          })
        .withMessage('penaltyAmount is required when releaseReasons includes "penalty"'),
    
    body('administrativeAmount')
        .custom((value, { req }) => {
            if (req.body.releaseReason?.includes(releaseReasons.administrativeCharge) && (value === undefined || value === null || isNaN(value) || typeof value !== 'number')) {
              return false
            }
            return true;
          })
        .withMessage('administrativeAmount is required when releaseReasons includes "administrativecharge"'),
    
    body('salesReceipt')
        .optional()
        .custom((value, { req }) => {
            if (req.body.releaseReason?.includes(releaseReasons.sales) && (value === undefined || value === null || value.trim().length == 0)) {
              return false
            }
            return true;
          })
        .withMessage('salesReceipt is required when releaseReasons includes "sales"'),
    
    body('penaltyReceipt')
        .optional()
        .custom((value, { req }) => {
            if (req.body.releaseReason?.includes(releaseReasons.penalty) && (value === undefined || value === null || value.trim().length == 0)) {
              return false
            }
            return true;
          })
        .withMessage('penaltyReceipt is required when releaseReasons includes "penalty"'),
    
    body('administrativeReceipt')
        .optional()
        .custom((value, { req }) => {
            if (req.body.releaseReason?.includes(releaseReasons.administrativeCharge) && (value === undefined || value === null || value.trim().length == 0)) {
              return false
            }
            return true;
          })
        .withMessage('administrativeReceipt is required when releaseReasons includes "administrative charge"'),

    body('resolvedReason')
        .optional()
        .custom((value, { req }) => {
            if (req.body.releaseReason?.includes(releaseReasons.resolved) && (value === undefined || value === null || value.trim().length == 0)) {
              return false
            }
            return true;
          })
        .withMessage('resolvedReason is required when releaseReasons includes "resolved"'),
    
  ],
  handleValidationErrors,
  markOffenceRecordCompleted
);

router.get('/all', getAllOffenceRecords);

router.get('/drafts', getAllDraftRecords);

router.get('/completed', getAllCompletedRecords);

router.get('/analytics', getAnalytics);

router.delete('/delete/:id', param('id').isMongoId().withMessage('Invalid Record ID'), handleValidationErrors, deleteOffenceRecord);


export default router;