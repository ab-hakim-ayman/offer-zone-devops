pipeline {
    agent any
    environment {
        registry = "dockerartisan/offer-zone-devops"
        registryCredential = 'docker-credentials'
        dockerImage = ''
        kubeconfigId = 'minikube-config'
    }
    stages {
        stage('Checkout Code') {
            steps {
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
                    withCredentials([file(credentialsId: kubeconfigId, variable: 'KUBECONFIG')]) {
                        bat '''
                            set KUBECONFIG=%KUBECONFIG%
                            kubectl apply -f k8s/nestjs-deployment.yaml
                        '''
                    }
                }
            }
        }
    }
}

// testing 1, 2, 3, 4, hello world

// pipeline {
//     agent any
//     environment {
//         registry = "dockerartisan/offer-zone-devops"
//         registryCredential = 'docker-credentials'
//         dockerImage = ''
//         kubeconfigId = 'kube-config' // Ensure this matches Jenkins credentials for kubeconfig
//     }
//     stages {
//         stage('Checkout Code') {
//             steps {
//                 // Check out the Git repository
//                 checkout([
//                     $class: 'GitSCM', 
//                     branches: [[name: '*/main']], 
//                     extensions: [], 
//                     userRemoteConfigs: [[
//                         credentialsId: 'github-credentials', 
//                         url: 'https://github.com/ab-hakim-ayman/offer-zone-devops.git'
//                     ]]
//                 ])
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     // Build the Docker image and tag with build number
//                     dockerImage = docker.build registry + ":$BUILD_NUMBER"
//                 }
//             }
//         }

//         stage('Push Docker Image') {
//             steps {
//                 script {
//                     // Push the Docker image to DockerHub
//                     docker.withRegistry('', registryCredential) {
//                         dockerImage.push()
//                         dockerImage.push('latest') // Push latest tag
//                     }
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes') {
//             steps {
//                 script {
//                     // Deploy the Docker image to Kubernetes
//                     kubernetesDeploy(
//                         kubeconfigId: kubeconfigId, // Reference kubeconfig credentials
//                         configs: 'k8s/nestjs-deployment.yaml',
//                         enableConfigSubstitution: true
//                     )
//                 }
//             }
//         }
//     }

//     post {
//         always {
//             // Clean up the workspace after the build testing
//             cleanWs()
//         }
//     }
// }


// pipeline {
//     agent any

//     stages {
//         stage('Clone Repository') {
//             steps {
//                 // Pull code from GitHub
//                 git url: 'https://github.com/ab-hakim-ayman/offer-zone-devops.git', branch: 'main'
//             }
//         }
//         stage('Build') {
//             steps {
//                 // Example build step, replace with actual build commands
//                 echo 'Building project...'
//             }
//         }
//         stage('Test') {
//             steps {
//                 // Example test step
//                 echo 'Running tests...'
//             }
//         }
//         stage('Deploy') {
//             steps {
//                 // Example deployment step
//                 echo 'Deploying application...'
//             }
//         }
//     }

//     post {
//         always {
//             // Cleanup or notify after every build
//             echo 'Pipeline finished.'
//         }
//     }
// }
