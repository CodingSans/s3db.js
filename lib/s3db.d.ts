import * as Ajv from 'ajv';
import * as slug from 'slug';
import * as s3 from 'aws-sdk/clients/s3';
export interface IS3DbDocument {
    id: string;
    createdAt: string;
    updatedAt: string;
}
export interface IS3DbModelIndexOption {
    name: string;
    valuePointer: string;
    type?: 'same' | 'reverse';
    length?: number;
}
export interface IS3DbModelOptions {
    ajvOptions?: Ajv.Options;
    validateOnRetrieve?: boolean;
    indices?: IS3DbModelIndexOption[];
}
export interface IS3DbIndexDocument {
    updated_at: string;
    latest_version: string;
}
export interface IS3DbModelFindOptions {
    limit?: number;
    skip?: number;
}
export interface IS3DbClientOptions {
    keyPrefix?: string;
    slugMode?: typeof slug.defaults.modes.rfc3986;
}
export declare class S3DbClient {
    s3: s3;
    bucketName: string;
    options: IS3DbClientOptions;
    _keyPrefix: string;
    _slugMode: typeof slug.defaults.modes.rfc3986;
    constructor(s3: s3, bucketName: string, options?: IS3DbClientOptions);
    model<T extends IS3DbDocument>(name: string, schema: Object, options?: IS3DbModelOptions): S3Model<IS3DbDocument>;
    _serializeObject(document: Object): string;
    _deserializeObject(data: string): Object;
    _putObject(key: string, body: string, options?: {
        contentType?: string;
    }): Promise<void>;
    _getObject(key: string): Promise<{
        metadata: {
            [key: string]: string;
        };
        body: string;
    }>;
    _headObject(key: string): Promise<{
        metadata: {
            [key: string]: string;
        };
    }>;
    _createIndexDocument(versionId: string, updatedAt: string): IS3DbIndexDocument;
    _getNewObjectId(): string;
    _slug(str: string): string;
    _getCollectionsFolderKey(): string;
    _getCollectionFolderKey(collectionName: string): string;
    _getDocumentsFolderKey(collectionName: string): string;
    _getDocumentFolderKey(collectionName: string, id: string): string;
    _getDocumentIndexKey(collectionName: string, id: string): string;
    _getDocumentVersionKey(collectionName: string, id: string, versionId: string): string;
    _getIndicesFolderKey(collectionName: string): string;
    _getIndexFolderKey(collectionName: string, indexName: string): string;
    _getIndexEntriesFolderKey(collectionName: string, indexName: string, value: string): string;
    _getIndexEntryFolderKey(collectionName: string, indexName: string, value: string, id: string): string;
    _getIndexEntryIndexKey(collectionName: string, indexName: string, value: string, id: string): string;
    _getIndexEntryVersionKey(collectionName: string, indexName: string, value: string, id: string, versionId: string): string;
    _getCurrentVersionId(): string;
    _currentUnixMs(): string;
    _currentJsonDate(): string;
}
export declare class S3Model<T extends IS3DbDocument> {
    client: S3DbClient;
    name: string;
    schema: Object;
    options: IS3DbModelOptions;
    static defaultAjvOptions: Ajv.Options;
    ajv: Ajv.Ajv;
    validate: Ajv.ValidateFunction;
    collectionName: string;
    constructor(client: S3DbClient, name: string, schema: Object, options?: IS3DbModelOptions);
    create(document: T & Partial<IS3DbDocument>): Promise<T>;
    get(id: string): Promise<T>;
    set(id: string, document: T): Promise<T>;
    update(id: string, documentPart: Partial<T>): Promise<T>;
    validateDocument(document: T): Promise<void>;
}
