import json
import os

def merge_json_files(input_dir, output_file):
    merged_data = []
    file_names = sorted([f for f in os.listdir(input_dir) if f.endswith('.json')], 
                        key=lambda x: int(x.split('_')[1].split('.')[0]))

    for file_name in file_names:
        file_path = os.path.join(input_dir, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                merged_data.extend(data)
            else:
                merged_data.append(data)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    input_directory = "raw json"
    output_json_file = "merged_grammar_data.json"
    merge_json_files(input_directory, output_json_file)
    print(f"Successfully merged JSON files from '{input_directory}' into '{output_json_file}'")
