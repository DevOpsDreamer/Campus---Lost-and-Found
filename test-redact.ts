import { RedactionPipeline } from './backend/node-controller/utils/redaction';

RedactionPipeline.processAndRedact('test.jpg', 'test-redacted.jpg')
  .then(console.log)
  .catch(err => {
    console.log("FULL ERROR LOG:");
    console.error(err);
  });
