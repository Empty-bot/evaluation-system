pipeline {
    agent any

    // ─── Variables globales ────────────────────────────────────────────────────
    environment {
        // Nom d'utilisateur Docker Hub
        DOCKER_HUB_USER     = 'emptybot'

        // Noms des images Docker
        BACKEND_IMAGE       = "${DOCKER_HUB_USER}/evaluation-backend"
        FRONTEND_IMAGE      = "${DOCKER_HUB_USER}/evaluation-frontend"

        // Tag basé sur le numéro de build Jenkins (ex: "42")
        // Permet de tracer exactement quel build correspond à quelle image
        IMAGE_TAG           = "${BUILD_NUMBER}"

        // Région AWS où sera déployé le cluster EKS
        AWS_REGION          = 'us-east-1'

        // Nom du cluster EKS (on le créera à l'étape AWS)
        EKS_CLUSTER_NAME    = 'evaluation-cluster'

        // Namespace Kubernetes dédié à notre application
        K8S_NAMESPACE       = 'evaluation-system'
    }

    stages {

        // ─── Stage 1 : Récupération du code source ─────────────────────────────
        // Jenkins clone le repo GitHub sur le workspace du build
        stage('Checkout') {
            steps {
                checkout scm
                echo "Code source récupéré — Branch: ${GIT_BRANCH}, Commit: ${GIT_COMMIT}"
            }
        }

        // ─── Stage 2 : Build de l'image Docker backend ────────────────────────
        // Construit l'image Express et la tague avec le numéro de build
        stage('Build Backend') {
            steps {
                echo "Build de l'image backend : ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh """
                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        ./backend
                """
            }
        }

        // ─── Stage 3 : Build de l'image Docker frontend ───────────────────────
        // Construit l'image React/Vite/Nginx
        // VITE_API_URL est injectée au moment du build car Vite l'embarque
        // dans le bundle JS — elle doit pointer vers le LoadBalancer AWS du backend
        stage('Build Frontend') {
            steps {
                echo "Build de l'image frontend : ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh """
                    docker build \
                        --build-arg VITE_API_URL=http://\$(kubectl get svc evaluation-backend-service \
                            -n ${K8S_NAMESPACE} \
                            --output jsonpath='{.status.loadBalancer.ingress[0].hostname}' \
                            2>/dev/null || echo 'localhost:3001') \
                        -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -t ${FRONTEND_IMAGE}:latest \
                        ./frontend
                """
            }
        }

        // ─── Stage 4 : Push des images vers Docker Hub ────────────────────────
        // Les credentials sont stockés dans Jenkins (jamais en clair dans le code)
        // Jenkins injecte automatiquement le username et le password via withCredentials
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest

                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest

                        docker logout
                    """
                }
            }
        }

        // ─── Stage 5 : Configuration de kubectl pour AWS EKS ──────────────────
        // Configure kubectl pour qu'il pointe vers notre cluster EKS
        // Les credentials AWS sont injectés de façon sécurisée par Jenkins
        stage('Configure kubectl') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'aws-credentials',
                    usernameVariable: 'AWS_ACCESS_KEY_ID',
                    passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                )]) {
                    sh """
                        aws configure set aws_access_key_id \$AWS_ACCESS_KEY_ID
                        aws configure set aws_secret_access_key \$AWS_SECRET_ACCESS_KEY
                        aws configure set region ${AWS_REGION}

                        # Met à jour le fichier kubeconfig local pour pointer vers EKS
                        aws eks update-kubeconfig \
                            --region ${AWS_REGION} \
                            --name ${EKS_CLUSTER_NAME}

                        kubectl get nodes
                    """
                }
            }
        }

        // ─── Stage 6 : Déploiement sur AWS EKS ────────────────────────────────
        // kubectl apply applique tous les manifests du dossier k8s/
        // Kubernetes compare l'état désiré (les fichiers yaml) avec l'état actuel
        // et effectue uniquement les changements nécessaires
        // La mise à jour de l'image déclenche un rolling update : les anciens pods
        // restent actifs jusqu'à ce que les nouveaux soient prêts (zéro downtime)
        stage('Deploy to EKS') {
            steps {
                sh """
                    # Créer le namespace s'il n'existe pas encore
                    kubectl apply -f k8s/namespace.yaml

                    # Appliquer les secrets (variables d'environnement sensibles)
                    kubectl apply -f k8s/secrets.yaml -n ${K8S_NAMESPACE}

                    # Déployer MySQL
                    kubectl apply -f k8s/mysql/ -n ${K8S_NAMESPACE}

                    # Déployer le backend
                    kubectl apply -f k8s/backend/ -n ${K8S_NAMESPACE}

                    # Déployer le frontend
                    kubectl apply -f k8s/frontend/ -n ${K8S_NAMESPACE}

                    # Forcer le rolling update avec la nouvelle image taguée
                    kubectl set image deployment/evaluation-backend \
                        backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}

                    kubectl set image deployment/evaluation-frontend \
                        frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}
                """
            }
        }

        // ─── Stage 7 : Déploiement du monitoring ──────────────────────────────
        // Prometheus collecte les métriques des pods Kubernetes
        // Grafana les visualise sous forme de dashboards
        stage('Deploy Monitoring') {
            steps {
                sh """
                    kubectl apply -f k8s/monitoring/prometheus/ -n ${K8S_NAMESPACE}
                    kubectl apply -f k8s/monitoring/grafana/ -n ${K8S_NAMESPACE}
                """
            }
        }

        // ─── Stage 8 : Vérification du déploiement ────────────────────────────
        // Attend que tous les pods soient en état Running avant de valider
        // --timeout=120s : si les pods ne sont pas prêts en 2 min, le pipeline échoue
        stage('Verify Deployment') {
            steps {
                sh """
                    echo "Vérification du déploiement backend..."
                    kubectl rollout status deployment/evaluation-backend \
                        -n ${K8S_NAMESPACE} --timeout=300s

                    echo "Vérification du déploiement frontend..."
                    kubectl rollout status deployment/evaluation-frontend \
                        -n ${K8S_NAMESPACE} --timeout=300s

                    echo "État des pods :"
                    kubectl get pods -n ${K8S_NAMESPACE}

                    echo "Services exposés :"
                    kubectl get svc -n ${K8S_NAMESPACE}
                """
            }
        }
    }

    // ─── Actions post-pipeline ─────────────────────────────────────────────────
    post {
        success {
            echo "Pipeline exécuté avec succès — Build #${BUILD_NUMBER}"
            // Nettoyage des images locales pour libérer l'espace disque de Jenkins
            sh """
                docker rmi ${BACKEND_IMAGE}:${IMAGE_TAG} || true
                docker rmi ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
            """
        }
        failure {
            echo "Pipeline échoué — Build #${BUILD_NUMBER} — Consulter les logs ci-dessus"
        }
        always {
            // Nettoyage du workspace Jenkins après chaque build
            cleanWs()
        }
    }
}