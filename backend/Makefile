.PHONY: makemigrations migrate runserver createsuperuser

## Django Commands
makemigrations: ## Make migrations
	python manage.py makemigrations

migrate: makemigrations ## Apply migrations
	python manage.py migrate

runserver: migrate  ## Run the Django development server
	python manage.py runserver

superuser: ## Create a superuser
	@python manage.py createsuperuser --no-input