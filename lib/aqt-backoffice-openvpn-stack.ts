import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class AqtBackofficeOpenvpnStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: '10.0.0.0/16',
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'Ingress',
          cidrMask: 24,
        },
      ],
    });

    const eip = new ec2.CfnEIP(this, 'EIP');

    const sg = new ec2.SecurityGroup(this, 'SG', {
      vpc,
    });

    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
    sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(1194));

    const instance = new ec2.Instance(this, 'Instance', {
      instanceType: new ec2.InstanceType('t2.medium'),
      machineImage: ec2.MachineImage.lookup({
        name: 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*',
        owners: ['099720109477'],
      }),
      vpc,
      securityGroup: sg,
    });

    new ec2.CfnEIPAssociation(this, 'EIPAssociation', {
      eip: eip.ref,
      instanceId: instance.instanceId,
    });
  }
}
