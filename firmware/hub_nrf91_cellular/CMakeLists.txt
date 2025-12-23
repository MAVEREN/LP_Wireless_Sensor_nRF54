cmake_minimum_required(VERSION 3.20.0)

find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(hub_cellular_gateway)

target_sources(app PRIVATE
    src/main.c
    src/network/lte_connection.c
    src/azure/iot_hub_client.c
    src/azure/device_twin.c
    src/azure/provisioning.c
    src/ipc/ipc_bridge.c
)

target_include_directories(app PRIVATE
    src
)
