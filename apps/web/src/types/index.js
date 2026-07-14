/**
 * ScopeWork — Core Type Definitions (JSDoc)
 * Use these as reference for data shapes across the app.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} ContractorRate
 * @property {string} id
 * @property {string} contractorId
 * @property {string} repairType       - e.g. "Drywall repair", "Paint room"
 * @property {string} unit             - e.g. "per sq ft", "per room", "flat"
 * @property {number} price
 */

/**
 * @typedef {Object} Contractor
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} [phone]
 * @property {string} [email]
 * @property {ContractorRate[]} rates
 */

/**
 * @typedef {Object} DetectedRepair
 * @property {string} type             - e.g. "Water damage", "Cracked drywall"
 * @property {'minor'|'moderate'|'major'} severity
 * @property {string} location         - e.g. "Ceiling, master bedroom"
 * @property {number} confidence       - 0 to 1
 */

/**
 * @typedef {Object} PhotoAnalysis
 * @property {'good'|'needs_improvement'} quality
 * @property {string} [feedback]       - e.g. "Get closer to the water damage"
 * @property {DetectedRepair[]} detectedRepairs
 */

/**
 * @typedef {Object} Photo
 * @property {string} id
 * @property {string} projectId
 * @property {string} url
 * @property {PhotoAnalysis} [aiAnalysis]
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Material
 * @property {string} name
 * @property {string} [sku]
 * @property {number} quantity
 * @property {string} unit
 * @property {number} unitPrice
 * @property {'homedepot'|'manual'} source
 * @property {string} [url]
 */

/**
 * @typedef {Object} RepairItem
 * @property {string} id
 * @property {string} projectId
 * @property {string} description
 * @property {string} repairType
 * @property {'minor'|'moderate'|'major'} severity
 * @property {number} [quantity]
 * @property {string} [unit]
 * @property {Material[]} [materials]
 * @property {number} [laborCost]
 * @property {number} [materialCost]
 * @property {number} [totalCost]
 */

/**
 * @typedef {Object} Estimate
 * @property {string} projectId
 * @property {number} laborTotal
 * @property {number} materialsTotal
 * @property {number} grandTotal
 * @property {Date} generatedAt
 * @property {string} [contractorId]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} address
 * @property {'active'|'completed'|'archived'} status
 * @property {Photo[]} photos
 * @property {RepairItem[]} repairItems
 * @property {Estimate} [estimate]
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
