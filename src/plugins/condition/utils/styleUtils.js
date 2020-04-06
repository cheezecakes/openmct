/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2020, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
const NONE_VALUE = '__no_value';

const styleProps = {
    backgroundColor: {
        svgProperty: 'fill',
        applicableForType: type => {
            return !type ? true : (type === 'text-view' ||
                                      type === 'telemetry-view' ||
                                      type === 'box-view');
        }
    },
    border: {
        svgProperty: 'stroke',
        applicableForType: type => {
            return !type ? true : (type === 'text-view' ||
                                            type === 'telemetry-view' ||
                                            type === 'box-view' ||
                                            type === 'image-view' ||
                                            type === 'line-view');
        }
    },
    color: {
        svgProperty: 'color',
        applicableForType: type => {
            return !type ? true : (type === 'text-view' ||
                                    type === 'telemetry-view');
        }
    },
    imageUrl: {
        svgProperty: 'url',
        applicableForType: type => {
            return !type ? false : type === 'image-view';
        }
    }
};

const aggregateStyleValues = (accumulator, currentStyle) => {
    const styleKeys = Object.keys(currentStyle);
    const properties = Object.keys(styleProps);
    properties.forEach((property) => {
        if (!accumulator[property]) {
            accumulator[property] = [];
        }
        const found = styleKeys.find(key => key === property);
        if (found) {
            accumulator[property].push(currentStyle[found]);
        }
    });
    return accumulator;
};

// Returns a union of styles used by multiple items.
// Styles that are not common to all items are added to the nonSpecific list
export const getConsolidatedStyleValues = (multipleItemStyles) => {
    let aggregatedStyleValues = multipleItemStyles.reduce(aggregateStyleValues, {});

    let styleValues = { nonSpecific: [] };
    const properties = Object.keys(styleProps);
    properties.forEach((property) => {
        const values = aggregatedStyleValues[property];
        if (values.length) {
            if (values.length !== multipleItemStyles.length) {
                styleValues[property] = NONE_VALUE;
                styleValues.nonSpecific.push(property);
            } else {
                if (values.every(value => value === values[0])) {
                    styleValues[property] = values[0];
                } else {
                    styleValues[property] = NONE_VALUE;
                    styleValues.nonSpecific.push(property);
                }
            }
        }
    });
    return styleValues;
};

const getStaticStyleForItem = (domainObject, id) => {
    let domainObjectStyles = domainObject && domainObject.configuration && domainObject.configuration.objectStyles;
    if (domainObjectStyles) {
        if (id && domainObjectStyles[id] && domainObjectStyles[id].staticStyle) {
            return domainObjectStyles[id].staticStyle.style;
        } else {
            return domainObjectStyles.staticStyle.style;
        }
    }
};

//Returns either existing static styles or uses SVG defaults if available
export const getInitialStyleForItem = (domainObject, item) => {
    const type = item && item.type;
    const id = item && item.id;
    let style = {};

    let staticStyle = getStaticStyleForItem(domainObject, id);

    const properties = Object.keys(styleProps);
    properties.forEach(property => {
        const styleProp = styleProps[property];
        if (styleProp.applicableForType(type)) {
            let defaultValue;
            if (staticStyle) {
                defaultValue = staticStyle[property];
            } else if (item) {
                defaultValue = item[styleProp.svgProperty];
            }
            style[property] = defaultValue === undefined ? NONE_VALUE : defaultValue;
        }
    });

    return style;
};
