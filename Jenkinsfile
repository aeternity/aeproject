
pipeline {
  agent {
    dockerfile {
      filename 'Dockerfile.ci'
      args '-v /etc/group:/etc/group:ro ' +
           '-v /etc/passwd:/etc/passwd:ro ' +
           '-v /var/lib/jenkins:/var/lib/jenkins ' +
           '-v /usr/bin/docker:/usr/bin/docker:ro ' +
           '--network=host ' +
		   "--name=forgae-${env.BUILD_NUMBER}"
    }
  }

  stages {
    
    stage('Test') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'genesis-wallet',
                                          usernameVariable: 'WALLET_PUB',
                                          passwordVariable: 'WALLET_PRIV')]) {

		  sh "DOCKER_HOST=tcp://localhost:2376 docker start forgae-${env.BUILD_NUMBER}"
		  sh "`DOCKER_HOST=tcp://localhost:2376 docker exec --privileged forgae-${env.BUILD_NUMBER} npm i -g mocha"
          sh "DOCKER_HOST=tcp://localhost:2376 docker exec forgae-${env.BUILD_NUMBER} npm test"
        }
      }
    }
  }

  post {
    always {
      junit 'test-results.xml'
      archive 'dist/*'
      sh "DOCKER_HOST=tcp://localhost:2376 docker stop forgae-${env.BUILD_NUMBER}"
	  sh "DOCKER_HOST=tcp://localhost:2376 docker rm forgae-${env.BUILD_NUMBER}"

    }
  }
}