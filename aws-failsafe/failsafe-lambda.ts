import { CloudFrontClient, GetDistributionConfigCommand, UpdateDistributionCommand } from "@aws-sdk/client-cloudfront";

exports.handler = async (event: any) => {
    console.log('Failsafe event received:', JSON.stringify(event))
    
    await shutdownCloudFront('*POTENTIALLY CONFIDENTIAL*')

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/json" },
        body: JSON.stringify({ message: "Failsafe execution success." }),
    };
};

async function shutdownCloudFront(cloudfrontId: string) {
    const client = new CloudFrontClient()
    const getDistroConfigCommand = new GetDistributionConfigCommand({ Id: cloudfrontId });
    const response = await client.send(getDistroConfigCommand)
    console.log('Intial config:')
    console.log(JSON.stringify(response))

    if (response['DistributionConfig'] && response['ETag']) {
        const updateDistroCommand = new UpdateDistributionCommand({ 
            Id: cloudfrontId,
            DistributionConfig: {
                ...response['DistributionConfig'],
                Enabled: false,
            },
            IfMatch: response['ETag']
        });

        const updateResponse = await client.send(updateDistroCommand)
        console.log('Update response:')
        console.log(JSON.stringify(updateResponse))
    } else {
        throw Error('DistributionConfig or Etag missing.')
    }
}
