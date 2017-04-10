/* tslint:disable:function-name variable-name */

import * as Ajv from 'ajv';
import * as _ from 'lodash';
import * as slug from 'slug';
import * as bson from 'bson';
import * as moment from 'moment';
import * as bluebird from 'bluebird';
import * as pointer from 'json-pointer';
import * as s3 from 'aws-sdk/clients/s3';

export interface IS3DbDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IS3DbModelIndexOption {
  // unique to model index name
  name: string;
  // JSON Pointer to the index value
  // https://tools.ietf.org/html/rfc6901
  valuePointer: string;
  // type of the index
  // same is the default, the value will be slugified and stored
  type?: 'same' | 'reverse';
  // defaults to max
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
  // prefix to all entries
  keyPrefix?: string;
  slugMode?: typeof slug.defaults.modes.rfc3986;
}

export class S3DbClient {
  _keyPrefix: string;
  _slugMode: typeof slug.defaults.modes.rfc3986;

  constructor(
    public s3: s3,
    public bucketName: string,
    public options: IS3DbClientOptions = {},
  ) {
    this._slugMode = options.slugMode || _.assign({}, slug.defaults.modes.rfc3986, { lower: false });

    if (options.keyPrefix) {
      this._keyPrefix = `/${ this._slug(_.trim(_.trim(options.keyPrefix), '/')) }`;
    } else {
      this._keyPrefix = '';
    }
  }

  model<T extends IS3DbDocument>(
    name: string,
    schema: Object,
    options: IS3DbModelOptions = {},
  ) {
    return new S3Model(
      this,
      name,
      schema,
      options,
    );
  }

  // // TODO
  // async listCollections(): Promise<string[]> {
  //   return [''];
  // }

  _serializeObject(document: Object): string {
    return JSON.stringify(document);
  }

  _deserializeObject(data: string): Object {
    return JSON.parse(data);
  }

  async _putObject(
    key: string,
    body: string,
    options: {
      contentType?: string;
    } = {},
  ): Promise<void> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: options.contentType || 'application/json',
    };
    try {
      await this.s3.putObject(params).promise();
      return;
    } catch (error) {
      throw error; // TODO handle some errors
    }
  }

  async _getObject(key: string): Promise<{ metadata: { [key: string]: string }, body: string }> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };
    try {
      const result = await this.s3.getObject(params).promise();
      return {
        metadata: result.Metadata || {},
        body: String(result.Body),
      };
    } catch (error) {
      throw error;
    }
  }

  async _headObject(key: string): Promise<{ metadata: { [key: string]: string } }> {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };
    try {
      const result = await this.s3.headObject(params).promise();
      return {
        metadata: result.Metadata || {},
      };
    } catch (error) {
      throw error;
    }
  }

  _createIndexDocument(versionId: string, updatedAt: string): IS3DbIndexDocument {
    return {
      updated_at: updatedAt,
      latest_version: versionId,
    };
  }

  _getNewObjectId(): string {
    return new bson.ObjectId().toHexString();
  }

  _slug(str: string): string {
    return slug(str, this._slugMode);
  }

  _getCollectionsFolderKey(): string {
    return `${this._keyPrefix}/collections`;
  }

  _getCollectionFolderKey(collectionName: string): string {
    const collectionsFolderKey = this._getCollectionsFolderKey();
    const collectionNameSlug = this._slug(collectionName);
    return `${collectionsFolderKey}/${collectionNameSlug}`;
  }

  _getDocumentsFolderKey(collectionName: string): string {
    const collectionFolderKey = this._getCollectionFolderKey(collectionName);
    return `${collectionFolderKey}/documents`;
  }

  _getDocumentFolderKey(collectionName: string, id: string): string {
    const documentsFolderKey = this._getDocumentsFolderKey(collectionName);
    const idSlug = this._slug(id);
    return `${documentsFolderKey}/${idSlug}`;
  }

  _getDocumentIndexKey(collectionName: string, id: string): string {
    const documentFolderKey = this._getDocumentFolderKey(collectionName, id);
    return `${documentFolderKey}/index.json`;
  }

  _getDocumentVersionKey(collectionName: string, id: string, versionId: string): string {
    const documentFolderKey = this._getDocumentFolderKey(collectionName, id);
    return `${documentFolderKey}/${versionId}.json`;
  }

  _getIndicesFolderKey(collectionName: string): string {
    const collectionFolderKey = this._getCollectionFolderKey(collectionName);
    return `${collectionFolderKey}/indices`;
  }

  _getIndexFolderKey(collectionName: string, indexName: string): string {
    const indicesFolderKey = this._getIndicesFolderKey(collectionName);
    const indexNameSlug = this._slug(indexName);
    return `${indicesFolderKey}/${indexNameSlug}`;
  }

  _getIndexEntriesFolderKey(collectionName: string, indexName: string, value: string) {
    const indexFolderKey = this._getIndexFolderKey(collectionName, indexName);
    const valueSlug = this._slug(value);
    return `${indexFolderKey}/${valueSlug}`;
  }

  _getIndexEntryFolderKey(collectionName: string, indexName: string, value: string, id: string) {
    const indexEntriesFolderKey = this._getIndexEntriesFolderKey(collectionName, indexName, value);
    const idSlug = this._slug(id);
    return `${indexEntriesFolderKey}/${idSlug}`;
  }

  _getIndexEntryIndexKey(collectionName: string, indexName: string, value: string, id: string): string {
    const indexEntryFolderKey = this._getIndexEntryFolderKey(collectionName, indexName, value, id);
    return `${indexEntryFolderKey}/index.json`;
  }

  _getIndexEntryVersionKey(collectionName: string, indexName: string, value: string, id: string, versionId: string): string {
    const indexEntryFolderKey = this._getIndexEntryFolderKey(collectionName, indexName, value, id);
    return `${indexEntryFolderKey}/${versionId}`;
  }

  _getCurrentVersionId(): string {
    return this._currentUnixMs();
  }

  _currentUnixMs(): string {
    return moment.utc().format('x');
  }

  _currentJsonDate(): string {
    return moment.utc().toJSON();
  }
}

export class S3Model<T extends IS3DbDocument> {
  static defaultAjvOptions: Ajv.Options = {
    useDefaults: true,
    removeAdditional: true,
    coerceTypes: true,
  };

  ajv: Ajv.Ajv;
  validate: Ajv.ValidateFunction;

  collectionName: string;

  constructor(
    public client: S3DbClient,
    public name: string,
    public schema: Object,
    public options: IS3DbModelOptions = {},
  ) {
    const ajvOptions: Ajv.Options = _.assign(
      S3Model.defaultAjvOptions,
      options.ajvOptions,
    );
    this.ajv = new Ajv();
    this.validate = this.ajv.compile(schema);
    this.collectionName = slug(this.name);
  }

  async create(document: T & Partial<IS3DbDocument>) {
    const id = this.client._getNewObjectId();
    const createdAt = this.client._currentJsonDate();
    const newDocument: T = _.assign({}, document, {
      id,
      createdAt,
      updatedAt: createdAt,
    } as IS3DbDocument);

    return this.set(id, newDocument);
  }

  // // TODO
  // async listIds() {
  //   return [''];
  // }

  async get(id: string) {
    const indexKey = this.client._getDocumentIndexKey(this.collectionName, id);
    const indexDocumentResult = await this.client._getObject(indexKey);
    const indexDocument = this.client._deserializeObject(indexDocumentResult.body) as IS3DbIndexDocument;
    const latestVersionId = indexDocument.latest_version;

    const versionKey = this.client._getDocumentVersionKey(this.collectionName, id, latestVersionId);
    const documentResult = await this.client._getObject(versionKey);
    const document = this.client._deserializeObject(documentResult.body) as T;

    if (this.options.validateOnRetrieve) {
      this.validateDocument(document);
    }

    return document;
  }

  async set(id: string, document: T): Promise<T> {
    this.validateDocument(document);

    const currentJsonDate = this.client._currentJsonDate();
    const currentVersionId = this.client._getCurrentVersionId();

    const versionKey = this.client._getDocumentVersionKey(this.collectionName, id, currentVersionId);

    const indexKey = this.client._getDocumentIndexKey(this.collectionName, id);
    const indexDocument = this.client._createIndexDocument(currentVersionId, currentJsonDate);

    const serializedDocument = this.client._serializeObject(document);
    const serializedIndexDocument = this.client._serializeObject(indexDocument);


    const baseUpload: [{ key: string, body: string }] = [
      {
        key: indexKey,
        body: serializedIndexDocument,
      },
      {
        key: versionKey,
        body: serializedDocument,
      },
    ];

    const indicesUpload = _.flatten(_.map(this.options.indices || [], (index) => {
      let value = String(pointer.get(document, index.valuePointer));
      if (index.type === 'reverse') {
        value = _.chain(value).split('').reverse().join('').value();
      }

      const indexEntryIndexKey = this.client._getIndexEntryIndexKey(this.collectionName, index.name, value, id);
      const indexEntryIndexDocument = this.client._createIndexDocument(currentVersionId, currentJsonDate);
      const serializedIndexEntryIndexDocument = this.client._serializeObject(indexEntryIndexDocument);

      const indexEntryVersionKey = this.client._getIndexEntryVersionKey(this.collectionName, index.name, value, id, currentVersionId);
      const indexEntryVersionDocument = {};
      const serializedIndexEntryVersionDocument = this.client._serializeObject(indexEntryVersionDocument);

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

    const allUpload = _.concat(baseUpload, indicesUpload);

    await bluebird.each(allUpload, ({ key, body }) => this.client._putObject(key, body));

    return document;
  }

  async update(id: string, documentPart: Partial<T>): Promise<T> {
    const currentDocument = await this.get(id);

    if (!currentDocument) {
      throw new Error(`S3Db document not found: [${id}]`);
    }

    const newDocument = _.assign({}, currentDocument, documentPart);

    this.validateDocument(newDocument);

    return this.set(id, newDocument);
  }

  // // TODO
  // async remove(id: string): Promise<void> {
  //   return;
  // }

  // // TODO
  // async count(): Promise<number> {
  //   return 2;
  // }

  async validateDocument(document: T): Promise<void> {
    this.validate(document);
  }

  // // TODO
  // async findIndex(indexName: string, value: string): Promise<T[]> {
  //   // maybe count?
  //   return [{}] as T[];
  // }

  // // TODO
  // async findIndexByPrefix(indexName: string, prefix: string): Promise<T[]> {
  //   // maybe count?
  //   return [{}] as T[];
  // }

  // // TODO
  // async scanIndex(indexName: string, regexp: RegExp): Promise<T[]> {
  //   return [{}] as T[];
  // }
}
