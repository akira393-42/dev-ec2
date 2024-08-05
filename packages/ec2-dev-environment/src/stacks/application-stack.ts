import { Stack, StackProps } from "aws-cdk-lib";
import { AmazonLinuxCpuType, AmazonLinuxGeneration, AmazonLinuxImage, Instance, InstanceClass, InstanceSize, InstanceType, ISecurityGroup, IVpc, KeyPair, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { IRole, ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import path from "path";

export interface ApplicationStackProps extends StackProps {
  userName: string,
  keyPairName: string
}


export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);
    let vpc: IVpc
    const vpcName = 'developer-vpc'
    vpc = Vpc.fromLookup(this, `${vpcName}-fromLookup`, {
      vpcName: vpcName
    });
    if (!vpc) {
      vpc = new Vpc(this, 'VPC', {
        vpcName: vpcName,
        maxAzs: 1,
        subnetConfiguration: [
          {
            cidrMask: 24,
            name: 'Public',
            subnetType: SubnetType.PUBLIC,
          }
        ]
      });
    }

    let sg: ISecurityGroup
    const sgName = 'Ec2DevSecurityGroup'
    sg = SecurityGroup.fromLookupByName(this, `${sgName}-fromLookupByName`, sgName, vpc)
    if (!sg) {
      sg = new SecurityGroup(this, 'SecurityGroup', {
        vpc: vpc,
        allowAllOutbound: true,
        securityGroupName: 'Ec2DevSecurityGroup'
      });
    }
    let ssmIamRole: IRole
    const ssmIamRoleName = 'SsmIamRole'
    ssmIamRole = Role.fromRoleArn(this, `${ssmIamRoleName}-fromRoleArn`, `arn:aws:iam::${this.account}:role/${ssmIamRoleName}`)
    if (!ssmIamRole) {
      ssmIamRole = new Role(this, "SsmIamRole", {
        assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore"),
        ],
      });
    }
    let keypair = KeyPair.fromKeyPairName(this, `${props.keyPairName}-fromKeyPairName`, props.keyPairName)
    if (!keypair) {
      keypair = new KeyPair(this, `${props.keyPairName}`, {
        keyPairName: props.keyPairName
      })
    }
    const instance = new Instance(this, `${props.userName}-develop-instance`, {
      vpc: vpc,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.XLARGE),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2023,
        cpuType: AmazonLinuxCpuType.X86_64
      }),
      securityGroup: sg,
      role: ssmIamRole,
      keyPair: keypair
    })

    const userDataScript = readFileSync(path.join(__dirname, './userData.sh'), 'utf-8')
    instance.addUserData(userDataScript)
  }
}
