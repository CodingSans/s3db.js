/* tslint:disable:function-name variable-name */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Ajv = require("ajv");
var _ = require("lodash");
var slug = require("slug");
var bson = require("bson");
var moment = require("moment");
var bluebird = require("bluebird");
var pointer = require("json-pointer");
var S3DbClient = (function () {
    function S3DbClient(s3, bucketName, options) {
        if (options === void 0) { options = {}; }
        this.s3 = s3;
        this.bucketName = bucketName;
        this.options = options;
        this._slugMode = options.slugMode || _.assign({}, slug.defaults.modes.rfc3986, { lower: false });
        if (options.keyPrefix) {
            this._keyPrefix = "/" + this._slug(_.trim(_.trim(options.keyPrefix), '/'));
        }
        else {
            this._keyPrefix = '';
        }
    }
    S3DbClient.prototype.model = function (name, schema, options) {
        if (options === void 0) { options = {}; }
        return new S3Model(this, name, schema, options);
    };
    // // TODO
    // async listCollections(): Promise<string[]> {
    //   return [''];
    // }
    S3DbClient.prototype._serializeObject = function (document) {
        return JSON.stringify(document);
    };
    S3DbClient.prototype._deserializeObject = function (data) {
        return JSON.parse(data);
    };
    S3DbClient.prototype._putObject = function (key, body, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var params, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            Bucket: this.bucketName,
                            Key: key,
                            Body: body,
                            ContentType: options.contentType || 'application/json',
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.s3.putObject(params).promise()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        error_1 = _a.sent();
                        throw error_1; // TODO handle some errors
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3DbClient.prototype._getObject = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var params, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            Bucket: this.bucketName,
                            Key: key,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.s3.getObject(params).promise()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, {
                                metadata: result.Metadata || {},
                                body: String(result.Body),
                            }];
                    case 3:
                        error_2 = _a.sent();
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3DbClient.prototype._headObject = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var params, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            Bucket: this.bucketName,
                            Key: key,
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.s3.headObject(params).promise()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, {
                                metadata: result.Metadata || {},
                            }];
                    case 3:
                        error_3 = _a.sent();
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    S3DbClient.prototype._createIndexDocument = function (versionId, updatedAt) {
        return {
            updated_at: updatedAt,
            latest_version: versionId,
        };
    };
    S3DbClient.prototype._getNewObjectId = function () {
        return new bson.ObjectId().toHexString();
    };
    S3DbClient.prototype._slug = function (str) {
        return slug(str, this._slugMode);
    };
    S3DbClient.prototype._getCollectionsFolderKey = function () {
        return this._keyPrefix + "/collections";
    };
    S3DbClient.prototype._getCollectionFolderKey = function (collectionName) {
        var collectionsFolderKey = this._getCollectionsFolderKey();
        var collectionNameSlug = this._slug(collectionName);
        return collectionsFolderKey + "/" + collectionNameSlug;
    };
    S3DbClient.prototype._getDocumentsFolderKey = function (collectionName) {
        var collectionFolderKey = this._getCollectionFolderKey(collectionName);
        return collectionFolderKey + "/documents";
    };
    S3DbClient.prototype._getDocumentFolderKey = function (collectionName, id) {
        var documentsFolderKey = this._getDocumentsFolderKey(collectionName);
        var idSlug = this._slug(id);
        return documentsFolderKey + "/" + idSlug;
    };
    S3DbClient.prototype._getDocumentIndexKey = function (collectionName, id) {
        var documentFolderKey = this._getDocumentFolderKey(collectionName, id);
        return documentFolderKey + "/index.json";
    };
    S3DbClient.prototype._getDocumentVersionKey = function (collectionName, id, versionId) {
        var documentFolderKey = this._getDocumentFolderKey(collectionName, id);
        return documentFolderKey + "/" + versionId + ".json";
    };
    S3DbClient.prototype._getIndicesFolderKey = function (collectionName) {
        var collectionFolderKey = this._getCollectionFolderKey(collectionName);
        return collectionFolderKey + "/indices";
    };
    S3DbClient.prototype._getIndexFolderKey = function (collectionName, indexName) {
        var indicesFolderKey = this._getIndicesFolderKey(collectionName);
        var indexNameSlug = this._slug(indexName);
        return indicesFolderKey + "/" + indexNameSlug;
    };
    S3DbClient.prototype._getIndexEntriesFolderKey = function (collectionName, indexName, value) {
        var indexFolderKey = this._getIndexFolderKey(collectionName, indexName);
        var valueSlug = this._slug(value);
        return indexFolderKey + "/" + valueSlug;
    };
    S3DbClient.prototype._getIndexEntryFolderKey = function (collectionName, indexName, value, id) {
        var indexEntriesFolderKey = this._getIndexEntriesFolderKey(collectionName, indexName, value);
        var idSlug = this._slug(id);
        return indexEntriesFolderKey + "/" + idSlug;
    };
    S3DbClient.prototype._getIndexEntryIndexKey = function (collectionName, indexName, value, id) {
        var indexEntryFolderKey = this._getIndexEntryFolderKey(collectionName, indexName, value, id);
        return indexEntryFolderKey + "/index.json";
    };
    S3DbClient.prototype._getIndexEntryVersionKey = function (collectionName, indexName, value, id, versionId) {
        var indexEntryFolderKey = this._getIndexEntryFolderKey(collectionName, indexName, value, id);
        return indexEntryFolderKey + "/" + versionId;
    };
    S3DbClient.prototype._getCurrentVersionId = function () {
        return this._currentUnixMs();
    };
    S3DbClient.prototype._currentUnixMs = function () {
        return moment.utc().format('x');
    };
    S3DbClient.prototype._currentJsonDate = function () {
        return moment.utc().toJSON();
    };
    return S3DbClient;
}());
exports.S3DbClient = S3DbClient;
var S3Model = (function () {
    function S3Model(client, name, schema, options) {
        if (options === void 0) { options = {}; }
        this.client = client;
        this.name = name;
        this.schema = schema;
        this.options = options;
        var ajvOptions = _.assign(S3Model.defaultAjvOptions, options.ajvOptions);
        this.ajv = new Ajv();
        this.validate = this.ajv.compile(schema);
        this.collectionName = slug(this.name);
    }
    S3Model.prototype.create = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var id, createdAt, newDocument;
            return __generator(this, function (_a) {
                id = this.client._getNewObjectId();
                createdAt = this.client._currentJsonDate();
                newDocument = _.assign({}, document, {
                    id: id,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                });
                return [2 /*return*/, this.set(id, newDocument)];
            });
        });
    };
    // // TODO
    // async listIds() {
    //   return [''];
    // }
    S3Model.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var indexKey, indexDocumentResult, indexDocument, latestVersionId, versionKey, documentResult, document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        indexKey = this.client._getDocumentIndexKey(this.collectionName, id);
                        return [4 /*yield*/, this.client._getObject(indexKey)];
                    case 1:
                        indexDocumentResult = _a.sent();
                        indexDocument = this.client._deserializeObject(indexDocumentResult.body);
                        latestVersionId = indexDocument.latest_version;
                        versionKey = this.client._getDocumentVersionKey(this.collectionName, id, latestVersionId);
                        return [4 /*yield*/, this.client._getObject(versionKey)];
                    case 2:
                        documentResult = _a.sent();
                        document = this.client._deserializeObject(documentResult.body);
                        if (this.options.validateOnRetrieve) {
                            this.validateDocument(document);
                        }
                        return [2 /*return*/, document];
                }
            });
        });
    };
    S3Model.prototype.set = function (id, document) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var currentJsonDate, currentVersionId, versionKey, indexKey, indexDocument, serializedDocument, serializedIndexDocument, baseUpload, indicesUpload, allUpload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.validateDocument(document);
                        currentJsonDate = this.client._currentJsonDate();
                        currentVersionId = this.client._getCurrentVersionId();
                        versionKey = this.client._getDocumentVersionKey(this.collectionName, id, currentVersionId);
                        indexKey = this.client._getDocumentIndexKey(this.collectionName, id);
                        indexDocument = this.client._createIndexDocument(currentVersionId, currentJsonDate);
                        serializedDocument = this.client._serializeObject(document);
                        serializedIndexDocument = this.client._serializeObject(indexDocument);
                        baseUpload = [
                            {
                                key: indexKey,
                                body: serializedIndexDocument,
                            },
                            {
                                key: versionKey,
                                body: serializedDocument,
                            },
                        ];
                        indicesUpload = _.flatten(_.map(this.options.indices || [], function (index) {
                            var value = String(pointer.get(document, index.valuePointer));
                            if (index.type === 'reverse') {
                                value = _.chain(value).split('').reverse().join('').value();
                            }
                            var indexEntryIndexKey = _this.client._getIndexEntryIndexKey(_this.collectionName, index.name, value, id);
                            var indexEntryIndexDocument = _this.client._createIndexDocument(currentVersionId, currentJsonDate);
                            var serializedIndexEntryIndexDocument = _this.client._serializeObject(indexEntryIndexDocument);
                            var indexEntryVersionKey = _this.client._getIndexEntryVersionKey(_this.collectionName, index.name, value, id, currentVersionId);
                            var indexEntryVersionDocument = {};
                            var serializedIndexEntryVersionDocument = _this.client._serializeObject(indexEntryVersionDocument);
                            return [
                                {
                                    key: indexEntryIndexKey,
                                    body: serializedIndexEntryIndexDocument,
                                },
                                {
                                    key: indexEntryVersionKey,
                                    body: serializedIndexEntryVersionDocument,
                                },
                            ];
                        }));
                        allUpload = _.concat(baseUpload, indicesUpload);
                        return [4 /*yield*/, bluebird.each(allUpload, function (_a) {
                                var key = _a.key, body = _a.body;
                                return _this.client._putObject(key, body);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, document];
                }
            });
        });
    };
    S3Model.prototype.update = function (id, documentPart) {
        return __awaiter(this, void 0, void 0, function () {
            var currentDocument, newDocument;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(id)];
                    case 1:
                        currentDocument = _a.sent();
                        if (!currentDocument) {
                            throw new Error("S3Db document not found: [" + id + "]");
                        }
                        newDocument = _.assign({}, currentDocument, documentPart);
                        this.validateDocument(newDocument);
                        return [2 /*return*/, this.set(id, newDocument)];
                }
            });
        });
    };
    // // TODO
    // async remove(id: string): Promise<void> {
    //   return;
    // }
    // // TODO
    // async count(): Promise<number> {
    //   return 2;
    // }
    S3Model.prototype.validateDocument = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.validate(document);
                return [2 /*return*/];
            });
        });
    };
    return S3Model;
}());
S3Model.defaultAjvOptions = {
    useDefaults: true,
    removeAdditional: true,
    coerceTypes: true,
};
exports.S3Model = S3Model;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiczNkYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zM2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGdEQUFnRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFaEQseUJBQTJCO0FBQzNCLDBCQUE0QjtBQUM1QiwyQkFBNkI7QUFDN0IsMkJBQTZCO0FBQzdCLCtCQUFpQztBQUNqQyxtQ0FBcUM7QUFDckMsc0NBQXdDO0FBNEN4QztJQUlFLG9CQUNTLEVBQU0sRUFDTixVQUFrQixFQUNsQixPQUFnQztRQUFoQyx3QkFBQSxFQUFBLFlBQWdDO1FBRmhDLE9BQUUsR0FBRixFQUFFLENBQUk7UUFDTixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLFlBQU8sR0FBUCxPQUFPLENBQXlCO1FBRXZDLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVqRyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLE1BQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFJLENBQUM7UUFDL0UsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDdkIsQ0FBQztJQUNILENBQUM7SUFFRCwwQkFBSyxHQUFMLFVBQ0UsSUFBWSxFQUNaLE1BQWMsRUFDZCxPQUErQjtRQUEvQix3QkFBQSxFQUFBLFlBQStCO1FBRS9CLE1BQU0sQ0FBQyxJQUFJ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