const debug = require('debug')('app:couchdb');
const axios = require('axios').default;
const _ = require('lodash');
const { customAssign } = require('../core');

const { url: defaultUrl } = require('../../config').couchdb;

exports.get = async ({ url, baseUrl = defaultUrl }) => {
  const { href } = new URL(url, baseUrl);
  try {
    const { data } = await axios.get(href, { timeout: 5000 });
    return { data };
  } catch (error) {
    debug(error);
    return { err: 'couchdb error', status: 417 };
  }
};

exports.createDesignDoc = async ({ dbname, docName, views, baseUrl = defaultUrl }) => {
  const { href } = new URL(`${dbname}/_design/${docName}`, baseUrl);
  try {
    const { data } = await axios.put(href, {
      language: 'javascript',
      _id: docName,
      views,
    }, { timeout: 5000 });
    return { data };
  } catch (error) {
    debug(error);
    return { err: 'couchdb error', status: 417 };
  }
};

exports.createView = async ({ dbname, docName, viewName, map, reduce, baseUrl = defaultUrl }) => {
  const { href } = new URL(`${dbname}/_design/${docName}`, baseUrl);
  try {
    const { data: doc } = await axios.get(href, { timeout: 5000 });

    if (!doc.views) doc.views = {};
    doc.views[viewName] = customAssign({}, { map, reduce });

    const { data } = await axios.put(href, JSON.stringify(doc), { timeout: 5000 });
    return { data };
  } catch (error) {
    debug(error);
    return { err: 'couchdb error', status: 417 };
  }
};

exports.createViews = async ({ dbname, docName, views, baseUrl = defaultUrl }) => {
  const { href } = new URL(`${dbname}/_design/${docName}`, baseUrl);
  try {
    const { data: doc } = await axios.get(href, { timeout: 5000 });

    if (!doc.views) doc.views = {};
    Object.assign(doc.views, views);

    const { data } = await axios.put(href, JSON.stringify(doc), { timeout: 5000 });
    return { data };
  } catch (error) {
    debug(error);
    return { err: 'couchdb error', status: 417 };
  }
};

exports.createDB = async ({ dbname, baseUrl = defaultUrl }) => {
  const { href } = new URL(dbname, baseUrl);
  try {
    const { data } = await axios.put(href, {}, { timeout: 5000 });
    return { data };
  } catch (error) {
    debug(error);
    const err = _.get(error, ['response', 'data', 'reason'], 'couchdb error');
    const status = _.get(error, ['response', 'status'], 417);
    return { err, status };
  }
};
