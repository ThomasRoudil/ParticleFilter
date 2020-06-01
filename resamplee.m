function [ xu_out, q_out ] = resamplee( xu_in, q_in )
%RESAMPLE �� �Լ��� ���� ���� 'ġ
%   �ڼ��� ���� 'ġ

[r, numParticle] = size(xu_in);

particle_tmp = zeros(r, numParticle);

q_in = q_in/sum(q_in);
weight_cdf = cumsum(q_in);
for j = 1:1:numParticle
    index_find = find(rand <= weight_cdf, 1);
    if isempty(index_find)
        [a, index_find] = max(q_in);
    end
    particle_tmp(:,j) = xu_in(:,index_find);
end
xu_out = particle_tmp;
q_out = ones(1,numParticle)/numParticle;


end
