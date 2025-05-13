# ASL

Django-based payroll web system for Estained in partial fulfillment of Info Management requirements

## Prerequisites

*   [Conda](https://docs.conda.io/en/latest/miniconda.html) (Miniconda recommended)
*   Git (for cloning the repository)

## Installation & Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone https://github.com/reimo22/ASL.git
    cd ASL
    ```

2.  **Create and activate Conda environment:**
    ```bash
    conda create -n asl_env python=3.13 -y
    conda activate asl_env
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install django django-widget-tweaks
    # pip install -r requirements.txt
    ```

4.  **Navigate to the Django project directory:**
    (This is the directory containing `manage.py`)
    ```bash
    cd DjangoProject
    ```

5.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **(Optional) Create a superuser:**
    (To access the Django admin panel)
    ```bash
    python manage.py createsuperuser
    ```

## Running the Development Server

1.  Ensure your `asl_env` Conda environment is activated.
2.  Make sure you are in the `DjangoProject` directory (where `manage.py` is located).
3.  Start the development server:
    ```bash
    python manage.py runserver
    ```
4.  Open your web browser and go to `http://127.0.0.1:8000/`.
