$locustfile = "locustfile_game.py"
$users = 10000
$spawn_rate = 500
$run_time = "150s"

$date_timestamp = $(((get-date).ToUniversalTime()).ToString("yyyy_MM_dd_HH_mm_ss"))
$target_dir = "results"
$target_html = "$target_dir\results_$date_timestamp.html"

New-Item -ItemType Directory -Force -Path $target_dir > $null

.\.venv\Scripts\Activate.ps1
locust --locustfile $locustfile --users $users --spawn-rate $spawn_rate --headless --run-time $run_time --html=$target_html