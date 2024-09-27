pipeline {
    agent any
    environment {
        registry = "dockerartisan/offer-zone-devops"
        registryCredential = 'docker-credentials'
        dockerImage = ''
        kubeconfigId = 'kube-config' // Ensure this matches Jenkins credentials for kubeconfig
    }
    stages {
        stage('Checkout Code') {
            steps {
                // Check out the Git repository
                checkout([
                    $class: 'GitSCM', 
                    branches: [[name: '*/main']], 
                    extensions: [], 
                    userRemoteConfigs: [[
                        credentialsId: 'github-credentials', 
                        url: 'https://github.com/ab-hakim-ayman/offer-zone-devops.git'
                    ]]
                ])
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image and tag with build number
                    dockerImage = docker.build registry + ":$BUILD_NUMBER"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Push the Docker image to DockerHub
                    docker.withRegistry('', registryCredential) {
                        dockerImage.push()
                        dockerImage.push('latest') // Push latest tag
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Deploy the Docker image to Kubernetes
                    kubernetesDeploy(
                        kubeconfigId: kubeconfigId, // Reference kubeconfig credentials
                        configs: 'k8s/nestjs-deployment.yaml',
                        enableConfigSubstitution: true
                    )
                }
            }
        }
    }

    post {
        always {
            // Clean up the workspace after the build .....
            cleanWs()
        }
    }
}
