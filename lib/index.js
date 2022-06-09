'use strict';

const Moment = require('moment');


const internals = {};


module.exports = (joi) => {

    const args = {
        format: joi.alternatives([
            joi.string(),
            joi.array().items(joi.string().invalid('iso', 'javascript', 'unix'))
        ])
    };

    return {

        type: 'date',
        base: joi.date(),

        coerce: {
            from: 'string',
            method: function (value, { schema }) {
                console.log('value', value);
                const format = schema.$_getFlag('format');
                console.log('format', format);

                let date;
                if (!format) {
                    return;
                }
                if (schema.$_getFlag('utc')) {
                    if (format === 'excel') {
                        const unixTimestamp = (Number(value) - 25569) * 86400000;
                        date = Moment.utc(new Date(unixTimestamp));
                    } else {
                        date = Moment.utc(value, format, true);
                    }
                } else {
                    if (format === 'excel') {
                        const unixTimestamp = (Number(value) - 25569) * 86400000;
                        date = Moment(new Date(unixTimestamp));
                    } else {
                        date = Moment(value, format, true);
                    }
                }
                if (date.isValid()) {
                    return { value: date.toDate() };
                }
            }
        },

        rules: {
            utc: {
                method: function (enabled = true) {

                    return this.$_setFlag('utc', enabled);
                }
            }
        },

        overrides: {
            format: function (format) {
                joi.attempt(format, args.format, 'Invalid format');

                if (['iso', 'javascript', 'unix'].includes(format)) {
                    return this.$_super.format(format);
                }

                return this.$_setFlag('format', format);
            }
        }
    };
};

// Default export for TypeScript module interop

module.exports.default = module.exports;
