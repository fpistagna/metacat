// FILE: RecordMetadataSchema.js

const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const customError = require('../../../utils/customError')
const className = "Mongoose:RecordMetadataModel",
  LoggerHelper = require('../../../utils/loggerHelper'),
  Logger = new LoggerHelper.Logger(className)
const { withAsyncHandler } = require('../../../utils/asyncHandler')
const { withLogging } = require('../../../utils/loggerWrapper')

const NameIdentifierSchema = new Schema({
  nameIdentifier: { type: String, required: true },
  nameIdentifierScheme: { type: String, required: true },
  schemeUri: String
}, { _id: false })

const AffiliationSchema = new Schema({
  name: { type: String, required: true },
  affiliationIdentifier: String,
  affiliationIdentifierScheme: String,
  schemeUri: String
}, { _id: false })

const PublisherSchema = new Schema({
  name: { type: String, required: true },
  publisherIdentifier: String,
  publisherIdentifierScheme: String,
  schemeUri: String,
  lang: String
}, { _id: false })

const TitleSchema = new Schema({
  title: { type: String, required: true },
  titleType: {
    type: String,
    enum: ['AlternativeTitle', 'Subtitle', 'TranslatedTitle', 'Other']
  },
  lang: String
}, { _id: false })

const SubjectSchema = new Schema({
  subject: { type: String, required: true },
  subjectScheme: String,
  schemeUri: String,
  valueUri: String,
  lang: String
}, { _id: false })

const DateSchema = new Schema({
  date: { type: String, required: true }, // Formato YYYY, YYYY-MM-DD, o intervallo YYYY/YYYY
  dateType: {
    type: String,
    required: true,
    enum: ['Accepted', 'Available', 'Collected', 'Copyrighted', 'Coverage', 'Created', 'Issued', 'Submitted', 'Updated', 'Valid', 'Withdrawn', 'Other']
  },
  dateInformation: String
}, { _id: false })

const DescriptionSchema = new Schema({
  description: { type: String, required: true },
  descriptionType: {
    type: String,
    required: true,
    enum: ['Abstract', 'Methods', 'SeriesInformation', 'TableOfContents', 'TechnicalInfo', 'Other']
  },
  lang: String
}, { _id: false })

const RightsSchema = new Schema({
  rights: { type: String, required: true },
  rightsUri: String,
  rightsIdentifier: String,
  rightsIdentifierScheme: String,
  schemeUri: String,
  lang: String
}, { _id: false })

const FundingReferenceSchema = new Schema({
  funderName: { type: String, required: true },
  funderIdentifier: {
    funderIdentifierType: {
      type: String,
      enum: ['ISNI', 'GRID', 'Crossref Funder ID', 'ROR', 'Other']
    },
    value: String
  },
  awardNumber: String,
  awardUri: String,
  awardTitle: String
}, { _id: false })

const GeoLocationPointSchema = new Schema({
  pointLongitude: { type: Number, required: true },
  pointLatitude: { type: Number, required: true }
}, { _id: false })

const GeoLocationBoxSchema = new Schema({
  westBoundLongitude: { type: Number, required: true },
  eastBoundLongitude: { type: Number, required: true },
  southBoundLatitude: { type: Number, required: true },
  northBoundLatitude: { type: Number, required: true },
}, { _id: false })

const GeoLocationPolygonSchema = new Schema({
  polygonPoints: { type: [GeoLocationPointSchema], required: true }
}, { _id: false })

const GeoLocationSchema = new Schema({
  geoLocationPlace: String,
  geoLocationPoint: GeoLocationPointSchema,
  geoLocationBox: GeoLocationBoxSchema,
  geoLocationPolygons: [GeoLocationPolygonSchema]
}, { _id: false })

const recordMetadataSchema = new Schema({
  // L'ID del documento in MongoDB sarà il DOI.
  // Usiamo _id per sfruttare l'indicizzazione automatica di MongoDB.
  _id: {
    type: String,
    alias: 'doi' // Puoi accedere a 'doi' e Mongoose userà '_id'
  },
  // Obbligatorio per lo schema JSON:API di DataCite
  type: {
    type: String,
    required: true,
    default: 'dois'
  },
  // L'oggetto 'attributes' contiene tutti i metadati principali
  attributes: {
    doi: {
      type: String,
      required: true
    },
    // Identificatori alternativi (es. URL, URN)
    identifiers: [{
      identifier: { type: String, required: true },
      identifierType: { type: String, required: true }
    }],
    // Autori/Creatori della risorsa (obbligatorio)
    creators: {
      type: [{
        name: { type: String, required: true },
        nameType: {
          type: String,
          enum: ['Organizational', 'Personal']
        },
        givenName: String,
        familyName: String,
        nameIdentifiers: [NameIdentifierSchema],
        affiliation: [AffiliationSchema]
      }],
      required: true
    },
    // Titoli della risorsa (obbligatorio)
    titles: {
      type: [TitleSchema],
      required: true
    },
    // Editore (obbligatorio)
    publisher: {
      type: PublisherSchema,
      required: true
    },
    // Anno di pubblicazione (obbligatorio)
    publicationYear: {
      type: String, // Usiamo String per flessibilità (es. "2023"), Number in Mongoose a volte è troppo restrittivo.
      required: true
    },
    // Soggetti o parole chiave
    subjects: [SubjectSchema],
    // Contributori (diversi dai creatori)
    contributors: [{
      contributorType: {
        type: String,
        required: true,
        enum: ['ContactPerson', 'DataCollector', 'DataCurator', 'DataManager', 'Distributor', 'Editor', 'HostingInstitution', 'Producer', 'ProjectLeader', 'ProjectManager', 'ProjectMember', 'RegistrationAgency', 'RegistrationAuthority', 'RelatedPerson', 'Researcher', 'ResearchGroup', 'RightsHolder', 'Sponsor', 'Supervisor', 'WorkPackageLeader', 'Other']
      },
      name: { type: String, required: true },
      nameType: {
        type: String,
        enum: ['Organizational', 'Personal']
      },
      givenName: String,
      familyName: String,
      nameIdentifiers: [NameIdentifierSchema],
      affiliation: [AffiliationSchema]
    }],
    // Date associate alla risorsa
    dates: [DateSchema],
    // Lingua della risorsa (codice IETF BCP 47, es. "en", "it-IT")
    language: String,
    // Tipo di risorsa (obbligatorio)
    resourceType: {
      resourceTypeGeneral: {
        type: String,
        required: true,
        enum: ['Audiovisual', 'Book', 'BookChapter', 'Collection', 'ComputationalNotebook', 'ConferencePaper', 'ConferenceProceeding', 'DataPaper', 'Dataset', 'Dissertation', 'Event', 'Image', 'InteractiveResource', 'Journal', 'JournalArticle', 'Model', 'OutputManagementPlan', 'PeerReview', 'PhysicalObject', 'Preprint', 'Report', 'Service', 'Software', 'Sound', 'Standard', 'Text', 'Workflow', 'Other']
      },
      resourceType: String // Descrizione più specifica del tipo
    },
    // Identificatori di risorse correlate
    relatedIdentifiers: [{
      relatedIdentifier: { type: String, required: true },
      relatedIdentifierType: {
        type: String,
        required: true,
        enum: ['ARK', 'arXiv', 'bibcode', 'DOI', 'EAN13', 'EISSN', 'Handle', 'IGSN', 'ISBN', 'ISSN', 'ISTC', 'LISSN', 'LSID', 'PMID', 'PURL', 'UPC', 'URL', 'URN', 'w3id']
      },
      relationType: {
        type: String,
        required: true,
        enum: ['IsCitedBy', 'Cites', 'IsSupplementTo', 'IsSupplementedBy', 'IsContinuedBy', 'Continues', 'IsNewVersionOf', 'IsPreviousVersionOf', 'IsPartOf', 'HasPart', 'IsReferencedBy', 'References', 'IsDocumentedBy', 'Documents', 'IsCompiledBy', 'Compiles', 'IsVariantFormOf', 'IsOriginalFormOf', 'IsIdenticalTo', 'HasMetadata', 'IsMetadataFor', 'Reviews', 'IsReviewedBy', 'IsDerivedFrom', 'IsSourceOf', 'Describes', 'IsDescribedBy', 'HasVersion', 'IsVersionOf', 'Requires', 'IsRequiredBy', 'Obsoletes', 'IsObsoletedBy']
      },
      relatedMetadataScheme: String,
      schemeUri: String,
      schemeType: String,
      resourceTypeGeneral: String
    }],
    // Dimensioni (es. "15 MB", "20 pagine")
    sizes: [String],
    // Formati (es. "PDF", "CSV", "application/json")
    formats: [String],
    // Versione della risorsa
    version: String,
    // Informazioni sui diritti
    rightsList: [RightsSchema],
    // Descrizioni (es. abstract)
    descriptions: [DescriptionSchema],
    // Informazioni geospaziali
    geoLocations: [GeoLocationSchema],
    // Riferimenti a finanziamenti
    fundingReferences: [FundingReferenceSchema]
  }
}, {
  // Opzioni dello schema
  timestamps: false, // Disabilitiamo i timestamps automatici di Mongoose (createdAt, updatedAt)
  // Usiamo il DOI come _id del documento
  _id: false
})

// Middleware di Mongoose per assicurarsi che l'ID e il DOI siano sincronizzati prima di ogni salvataggio.
recordMetadataSchema.pre('save', function (next) {
  // Imposta l'_id del documento uguale al DOI definito negli attributi
  this._id = this.attributes.doi
  next()
})

// Crea un indice di testo su tutti i campi di tipo stringa per la ricerca full-text
recordMetadataSchema.index({ "$**": "text" })

// =================================================================
// CLASSE MODELLO
// =================================================================

class RecordMetadataModel {
  static model = mongoose.model("RecordMetadata", recordMetadataSchema)

  static async getMetadataById(id) {
    return await this.model.findById(id)
  }

  static async _recordByQuery(query) {
    Logger.logs({ verbose: { query: JSON.stringify(query) } })
    return await this.model.find({ $text: { $search: query.q } })
  }

  static async _createMetadata(object) {
    Logger.logs({ verbose: { metadata: JSON.stringify(object) } })

    const metadataObject = object.metadata
    // Se l'oggetto Metadata esiste già creiamo una nuova eccezzione/errore
    if (await this.getMetadataById(object.metadata.attributes.doi))
      throw new customError.MetadataError(10,
        `Create Metadata Error: ${object.metadata.attributes.doi} already exist in DB.`,
        { recordMetadataId: object.metadata.attributes.doi })
        
    const newRecordMetadata = new this.model(metadataObject)

    // Salva il nuovo documento. Il middleware 'pre-save' si occuperà di sincronizzare l'ID.
    const savedRecord = await newRecordMetadata.save()
    Logger.logs({
        debug: { id: savedRecord._id },
        verbose: { 
          id: savedRecord._id,
          metadata: savedRecord }
    })

    return savedRecord
  }

  static async _updateMetadataAttribute(id, key, value) {
    Logger.logs({
      verbose: {
        id: id,
        attribute: key,
        value: JSON.stringify(value)
      }
    })

    const updateQuery = { $set: { [`attributes.${key}`]: value } }

    const updatedMetadata = await this.model.findByIdAndUpdate(
      id, 
      updateQuery, 
      { new: true, runValidators: true })

    if (!updatedMetadata)
      throw new customError.MetadataError(11,
        `Update Metadata Error: ${id} did not updated successfully.`,
        { recordMetadataId: null })

    Logger.logs({ verbose: { metadata: JSON.stringify(updatedMetadata) } })

    return updatedMetadata
  }
}

RecordMetadataModel.recordByQuery = withAsyncHandler(withLogging(RecordMetadataModel._recordByQuery, Logger))
RecordMetadataModel.createMetadata = withAsyncHandler(withLogging(RecordMetadataModel._createMetadata, Logger))
RecordMetadataModel.updateMetadataAttribute = withAsyncHandler(withLogging(RecordMetadataModel._updateMetadataAttribute, Logger))


module.exports.RecordMetadataModel = RecordMetadataModel