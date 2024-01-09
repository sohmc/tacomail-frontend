import { winstonLogger } from '@/serverComponents/logger';

// This gets IAM credentials assigned to EC2
export async function getIamCredentials() {
  let iamCredentials = {
    'AccessKeyId' : process.env.AWS_ACCESS_KEY || '',
    'SecretAccessKey' : process.env.AWS_SECRET_KEY || '',
    'Source': '.env',
  };

  if (Object.prototype.hasOwnProperty.call(process.env, 'AWS_ACCESS_KEY')) {
    winstonLogger.info('(fetchIamCredentials.getIamCredentials) AWS_ACCESS_KEY is already set.  Returning already set credentials.');
    return iamCredentials;
  }

  // https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-identity-roles.html
  const fetchResults = await fetch('http://169.254.169.254/latest/meta-data/identity-credentials/ec2/security-credentials/ec2-instance');

  const data = await fetchResults.json();
  winstonLogger.debug('(fetchIamCredentials.getIamCredentials) fetchResults -- ' + JSON.stringify(data));

  iamCredentials = { ...data, 'Source': 'IMDS' };

  return iamCredentials;
}