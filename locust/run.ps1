$locustfile_name = "locustfile_single_game_rotation"
$locustfile_path = "locustfiles\${locustfile_name}.py"
$results_target_dir = "results"

$users = 2
$spawn_rate = 2
$run_time = "10m"

$date_timestamp = $(((get-date).ToUniversalTime()).ToString("yyyy_MM_dd_HH_mm_ss"))
$target_html = "$results_target_dir\${locustfile_name}_${date_timestamp}.html"

New-Item -ItemType Directory -Force -Path $results_target_dir > $null

.\.venv\Scripts\Activate.ps1
locust --locustfile $locustfile_path --users $users --spawn-rate $spawn_rate --headless --run-time $run_time --html=$target_html