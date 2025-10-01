pipeline {
    agent any

    environment {
        // --- IMPORTANT: REPLACE THESE PLACEHOLDERS ---
        AWS_REGION = 'us-east-1' // e.g., us-east-1
        ECR_REGISTRY = '426333731357.dkr.ecr.us-east-1.amazonaws.com' // e.g., 123456789012.dkr.ecr.us-east-1.amazonaws.com
        BACKEND_IMAGE_NAME = 'languagebook-backend'
        FRONTEND_IMAGE_NAME = 'languagebook-frontend'
        ECS_CLUSTER_NAME = 'languagebook-cluster-real2'
        BACKEND_SERVICE_NAME = 'languagebook-backend-task-service-2'
        FRONTEND_SERVICE_NAME = 'languagebook-frontend-task-service-2'
        // This makes sure the AWS CLI can be used by Jenkins
        AWS_CREDENTIALS = credentials('jenkins-aws-creds')
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Backend Image') {
            steps {
                script {
                    // Use the Jenkins build number as a unique tag
                    def imageTag = "${env.BUILD_NUMBER}"
                    def fullImageName = "${ECR_REGISTRY}/${BACKEND_IMAGE_NAME}:${imageTag}"

                    // Login to AWS ECR
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                    // Build the Docker image from the 'backend' directory
                    sh "docker build -t ${fullImageName} ./backend"

                    // Push the Docker image to ECR
                    sh "docker push ${fullImageName}"
                }
            }
        }

        stage('Build & Push Frontend Image') {
            steps {
                script {
                    def imageTag = "${env.BUILD_NUMBER}"
                    def fullImageName = "${ECR_REGISTRY}/${FRONTEND_IMAGE_NAME}:${imageTag}"

                    // ECR login is already done, but it's safe to repeat
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"

                    // Build the Docker image from the 'frontend' directory
                    sh "docker build -t ${fullImageName} ./frontend"

                    // Push the Docker image to ECR
                    sh "docker push ${fullImageName}"
                }
            }
        }

        stage('Deploy to AWS Fargate') {
            steps {
                script {
                    def imageTag = "${env.BUILD_NUMBER}"
                    
                    echo "Deploying new version with tag: ${imageTag}"

                    // Force a new deployment of the backend service.
                    // NOTE: This assumes your ECS Task Definition is configured to use the 'latest' tag,
                    // or you have another process to update the task definition with the new imageTag.
                    // For a simple setup, retagging 'latest' is common. A more advanced setup updates the task definition.
                    sh "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${BACKEND_SERVICE_NAME} --force-new-deployment --region ${AWS_REGION}"

                    // Force a new deployment of the frontend service
                    sh "aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${FRONTEND_SERVICE_NAME} --force-new-deployment --region ${AWS_REGION}"
                }
            }
        }
    }
}