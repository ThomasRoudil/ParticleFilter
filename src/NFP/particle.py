def get_particle(filename):
    nb_particle = 50
    particles = [
        {
            'x': random.randint(1, 1000),
            'y': random.randint(1, 1000),
            'h': None
        } for element in range(nb_particle)
                ]
    return particles