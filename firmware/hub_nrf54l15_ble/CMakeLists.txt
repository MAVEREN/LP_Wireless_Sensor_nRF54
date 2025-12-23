# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.20.0)
find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(hub_ble_central)

target_sources(app PRIVATE
    src/main.c
    src/ble_central/scanner.c
    src/ble_central/connection_manager.c
    src/ble_central/gatt_client.c
    src/node_manager/node_manager.c
    src/job_executor/job_executor.c
    src/ipc/ipc_handler.c
    src/storage/storage.c
)

target_include_directories(app PRIVATE 
    src 
    src/ble_central
    src/node_manager
    src/job_executor
    src/ipc
    src/storage
)
