
const createEventSchema = {
    body: {
    type: 'object',
    required: ['event', 'form'],
    properties: {
      event: { type: 'object' },
      form: { type: 'object' }
    },
    additionalProperties: true
  }
};

export {createEventSchema}