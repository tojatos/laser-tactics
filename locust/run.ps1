$locustfile = "locustfile.py"
$users = 100
$spawn_rate = 100
$run_time = "15s"

$date_timestamp = $(((get-date).ToUniversalTime()).ToString("yyyy_MM_dd_HH_mm_ss"))
$target_dir = "results"
$target_html = "$target_dir\results_$date_timestamp.html"

New-Item -ItemType Directory -Force -Path $target_dir

.\.venv\Scripts\Activate.ps1
locust --locustfile $locustfile --users $users --spawn-rate $spawn_rate --headless --run-time $run_time --html=$target_html